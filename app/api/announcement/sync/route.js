import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { postSiteAnnouncement } from "@/lib/discord";
import { SITE_ANNOUNCEMENT } from "@/lib/siteAnnouncement";
import AnnouncementDispatch from "@/models/AnnouncementDispatch";

export const runtime = "nodejs";

export async function POST() {
  try {
    await connectDB();

    const existing = await AnnouncementDispatch.findOne({
      kind: SITE_ANNOUNCEMENT.kind,
      version: SITE_ANNOUNCEMENT.version,
      status: "sent",
    }).lean();

    if (existing) {
      return NextResponse.json({ ok: true, skipped: true, reason: "already_sent" });
    }

    let dispatchRecord;
    try {
      dispatchRecord = await AnnouncementDispatch.create({
        kind: SITE_ANNOUNCEMENT.kind,
        version: SITE_ANNOUNCEMENT.version,
        status: "sending",
      });
    } catch (error) {
      if (error?.code === 11000) {
        return NextResponse.json({ ok: true, skipped: true, reason: "already_claimed" });
      }
      throw error;
    }

    try {
      const result = await postSiteAnnouncement(SITE_ANNOUNCEMENT);

      await AnnouncementDispatch.updateOne(
        { _id: dispatchRecord._id },
        {
          $set: {
            status: result.sent ? "sent" : "failed",
            channelId: result.channelId || "",
            messageId: result.messageId || "",
            sentAt: result.sent ? new Date() : null,
            lastError: "",
          },
        }
      );

      return NextResponse.json({ ok: true, sent: result.sent, skipped: result.skipped });
    } catch (error) {
      await AnnouncementDispatch.updateOne(
        { _id: dispatchRecord._id },
        {
          $set: {
            status: "failed",
            lastError: String(error?.message || error || "Unknown Discord error"),
          },
        }
      );

      console.error("Announcement Discord publish failed:", error);
      return NextResponse.json(
        { ok: false, error: "Failed to publish announcement" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Announcement sync error:", error);
    return NextResponse.json({ ok: false, error: "Failed to sync announcement" }, { status: 500 });
  }
}
