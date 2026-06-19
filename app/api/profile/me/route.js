import { currentUser, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserProfile, getProfileBundleBySlug } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(user);
    const bundle = await getProfileBundleBySlug(profile.slug);

    return NextResponse.json(bundle || { profile: null, placements: [], scoreRows: [] });
  } catch (error) {
    console.error("Profile GET failed:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await ensureUserProfile(user);
    const body = await req.json();

    const bio = String(body?.bio || "").slice(0, 320).trim();
    const title = String(body?.title || "").slice(0, 40).trim();
    const keyboardLayout = String(body?.keyboardLayout || "QWERTY").slice(0, 32).trim() || "QWERTY";
    const altLayoutAccount = String(body?.altLayoutAccount || "").slice(0, 120).trim();

    const socials = {
      website: String(body?.socials?.website || "").slice(0, 200).trim(),
      youtube: String(body?.socials?.youtube || "").slice(0, 200).trim(),
      twitch: String(body?.socials?.twitch || "").slice(0, 200).trim(),
      tiktok: String(body?.socials?.tiktok || "").slice(0, 200).trim(),
      instagram: String(body?.socials?.instagram || "").slice(0, 200).trim(),
      github: String(body?.socials?.github || "").slice(0, 200).trim(),
      discord: String(body?.socials?.discord || "").slice(0, 120).trim(),
    };

    await profile.updateOne({
      $set: {
        bio,
        title,
        keyboardLayout,
        altLayoutAccount,
        socials,
      },
    });

    const bundle = await getProfileBundleBySlug(profile.slug);
    return NextResponse.json(bundle || { profile: null, placements: [], scoreRows: [] });
  } catch (error) {
    console.error("Profile PUT failed:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
