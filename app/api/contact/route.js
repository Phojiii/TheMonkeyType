import { currentUser, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { postContactSubmission } from "@/lib/discord";
import { connectDB } from "@/lib/mongodb";
import ContactRateLimit from "@/models/ContactRateLimit";
import { createHash } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES = new Set([
  "General Support",
  "Account Help",
  "Bug Report",
  "Feature Request",
  "Challenge / Leaderboard Issue",
  "Partnership / Business",
  "Other",
]);
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 3;
const MAX_REQUEST_BYTES = 9 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function allowContactRequest(req) {
  const forwardedFor = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ip = forwardedFor.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const window = Math.floor(now / RATE_WINDOW_MS);
  const key = createHash("sha256").update(`${ip}:${window}`).digest("hex");

  await connectDB();
  let submission;
  try {
    submission = await ContactRateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * RATE_WINDOW_MS) } },
      { upsert: true, new: true }
    ).lean();
  } catch (error) {
    if (error?.code !== 11000) throw error;
    submission = await ContactRateLimit.findOneAndUpdate(
      { key },
      { $inc: { count: 1 } },
      { new: true }
    ).lean();
  }

  return {
    allowed: submission.count <= RATE_LIMIT,
    retryAfter: Math.max(1, Math.ceil(((window + 1) * RATE_WINDOW_MS - now) / 1000)),
  };
}

function sanitizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req) {
  try {
    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ error: "Request must be smaller than 9MB." }, { status: 413 });
    }

    const { allowed, retryAfter } = await allowContactRequest(req);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many contact messages. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    const { userId } = getAuth(req);
    const signedInUser = userId ? await currentUser().catch(() => null) : null;

    const formData = await req.formData();
    if (sanitizeText(formData.get("companyWebsite"), 200)) {
      return NextResponse.json({ ok: true, message: "Your message has been sent successfully." });
    }
    const fullName = sanitizeText(formData.get("fullName"), 120);
    const email = sanitizeText(formData.get("email"), 160).toLowerCase();
    const categoryRaw = sanitizeText(formData.get("category"), 80);
    const category = CATEGORIES.has(categoryRaw) ? categoryRaw : "Other";
    const message = sanitizeText(formData.get("message"), 4000);
    const usernameInput = sanitizeText(formData.get("username"), 80);

    if (!fullName) {
      return NextResponse.json({ error: "Full Name is required." }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long." },
        { status: 400 }
      );
    }

    const imageField = formData.get("image");
    const image = imageField && typeof imageField === "object" && "size" in imageField ? imageField : null;

    if (image?.size) {
      const maxBytes = 8 * 1024 * 1024;
      if (image.size > maxBytes) {
        return NextResponse.json(
          { error: "Image must be smaller than 8MB." },
          { status: 400 }
        );
      }
      if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
        return NextResponse.json({ error: "Use a PNG, JPEG, WebP, or GIF image." }, { status: 415 });
      }
    }

    const username = usernameInput || signedInUser?.username || signedInUser?.fullName || "";

    const result = await postContactSubmission({
      fullName,
      email,
      category,
      message,
      username,
      userId: signedInUser?.id || "",
      image: image?.size ? image : null,
    });

    if (result?.skipped) {
      return NextResponse.json(
        { error: "Contact service is not configured right now." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true, message: "Your message has been sent successfully." });
  } catch (error) {
    console.error("Contact submission failed:", error);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again." },
      { status: 500 }
    );
  }
}
