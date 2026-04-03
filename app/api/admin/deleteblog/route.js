import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { ADMINS } from "@/lib/admins";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const runtime = "nodejs";

export async function DELETE(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !ADMINS.includes(userId))
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    if (!slug)
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    await connectDB();
    const deleted = await Blog.findOneAndDelete({ slug });
    if (!deleted) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete blog error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
