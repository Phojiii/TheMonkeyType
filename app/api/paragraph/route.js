import { NextResponse } from "next/server";
import { makeStreamGenerator } from "@/lib/textbanks";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "english";

  const gen = makeStreamGenerator({ lang, punctuation: false, numbers: false });
  const paragraph = gen.nextChunk(60).trim();

  return NextResponse.json({ paragraph, lang });
}
