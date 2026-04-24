import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { ADMINS } from "@/lib/admins";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const runtime = "nodejs";

function ensureAdmin(req) {
  const { userId } = getAuth(req);
  return userId && ADMINS.includes(userId);
}

function makeSlug(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim();
}

export async function GET(req) {
  try {
    if (!ensureAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const post = await Blog.findOne({ slug }).lean();
      if (!post) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }

      return NextResponse.json({
        post: {
          slug: post.slug,
          title: post.title || "",
          excerpt: post.excerpt || "",
          author: post.author || "TheMonkeyType Team",
          date: post.date || null,
          cover: post.cover || "",
          content: post.content || "",
        },
      });
    }

    const posts = await Blog.find({}, { slug: 1, title: 1, excerpt: 1, author: 1, date: 1, cover: 1 })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      posts: posts.map((post) => ({
        slug: post.slug,
        title: post.title || "Untitled",
        excerpt: post.excerpt || "",
        author: post.author || "TheMonkeyType Team",
        date: post.date || null,
        cover: post.cover || "",
      })),
    });
  } catch (error) {
    console.error("Admin blogs GET error:", error);
    return NextResponse.json({ error: "Failed to load blogs" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    if (!ensureAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const originalSlug = String(formData.get("originalSlug") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const author = String(formData.get("author") || "").trim();
    const excerpt = String(formData.get("excerpt") || "").trim();
    const content = String(formData.get("content") || "");
    const cover = String(formData.get("cover") || "").trim();

    if (!originalSlug || !title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const slug = makeSlug(title);
    if (!slug) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    await connectDB();

    const current = await Blog.findOne({ slug: originalSlug });
    if (!current) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (slug !== originalSlug) {
      const conflict = await Blog.findOne({ slug }).lean();
      if (conflict) {
        return NextResponse.json({ error: "Another blog already uses this title" }, { status: 409 });
      }
    }

    current.slug = slug;
    current.title = title;
    current.author = author || current.author || "TheMonkeyType Team";
    current.excerpt = excerpt;
    current.cover = cover.startsWith("http") ? cover : "";
    current.content = content;
    await current.save();

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Admin blogs PUT error:", error);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}
