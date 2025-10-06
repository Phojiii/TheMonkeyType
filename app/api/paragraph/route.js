import { NextResponse } from "next/server";
import { randomParagraph } from "@/lib/textbanks";

export async function GET(req){
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang") || "english";
  const paragraph = randomParagraph(lang);
  return NextResponse.json({ paragraph, lang });
}
