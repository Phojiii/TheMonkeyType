import { NextResponse } from "next/server";
import { getProfileBundleBySlug } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, context) {
  const params = await context.params;
  const bundle = await getProfileBundleBySlug(params.slug);

  if (!bundle) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(bundle, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
