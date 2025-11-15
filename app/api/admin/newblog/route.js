import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { ADMINS } from "@/lib/admins";

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
    const cover = formData.get("cover"); // this can now be a Cloudinary URL string

    if (!title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .trim();

    // ✅ Use Cloudinary URL directly if provided
    let coverUrl = "";
    if (cover && typeof cover === "string" && cover.startsWith("http")) {
      coverUrl = cover;
    }

    const markdown = `---
title: "${title}"
author: "${author || "TheMonkeyType Team"}"
date: "${new Date().toISOString()}"
excerpt: "${excerpt || ""}"
cover: "${coverUrl}"
---

${content}
`;

    // Upload Markdown file to Vercel Blob (this stays the same)
    const mdBlob = await put(`blogs/${slug}.md`, markdown, { access: "public" });

    return NextResponse.json({ success: true, slug, url: mdBlob.url });
  } catch (err) {
    console.error("Blog upload error:", err);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
