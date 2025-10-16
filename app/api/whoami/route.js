import { getAuth } from "@clerk/nextjs/server";

export async function GET(req) {
  const { userId, sessionId } = getAuth(req);
  return new Response(JSON.stringify({ userId, sessionId }), { status: 200 });
}
