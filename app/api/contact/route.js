import { currentUser, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { postContactSubmission } from "@/lib/discord";

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

function sanitizeText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const signedInUser = userId ? await currentUser().catch(() => null) : null;

    const formData = await req.formData();
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
