import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { ADMINS } from "@/lib/admins";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId || !ADMINS.includes(userId))
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    return NextResponse.json(
      { error: "Direct upload endpoint is deprecated. Use Cloudinary upload in the admin form." },
      { status: 410 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
