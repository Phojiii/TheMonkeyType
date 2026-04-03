import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { ADMINS } from "@/lib/admins";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !ADMINS.includes(userId))
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const formData = await req.formData();
    const title = formData.get("title");
    const author = formData.get("author");
    const excerpt = formData.get("excerpt");
    const content = formData.get("content");
    const cover = formData.get("cover");

    if (!title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .trim();

    if (!slug) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    let coverUrl = "";
    if (cover && typeof cover === "string" && cover.startsWith("http")) {
      coverUrl = cover;
    }

    await connectDB();

    const existing = await Blog.findOne({ slug }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "A blog with this title already exists" },
        { status: 409 }
      );
    }

    await Blog.create({
      slug,
      title,
      author: author || "TheMonkeyType Team",
      date: new Date(),
      excerpt: excerpt || "",
      cover: coverUrl,
      content,
    });

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error("Blog upload error:", err);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
