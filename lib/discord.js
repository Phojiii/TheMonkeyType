function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://themonkeytype.com";

  return raw.replace(/\/+$/, "");
}

function formatAnnouncementParagraph(paragraph, index) {
  const text = String(paragraph || "").trim();
  if (!text) return "";

  if (index === 0) return text;
  return `• ${text}`;
}

function buildSiteAnnouncementDiscordContent(announcement) {
  const title = `🚀 TheMonkeyType v${announcement.version} Update is Live!`;
  const paragraphs = Array.isArray(announcement?.modalParagraphs)
    ? announcement.modalParagraphs
    : [];

  return [
    "@everyone",
    title,
    "",
    `**${announcement.modalTitle || "What's New"}**`,
    ...paragraphs
      .map((paragraph, index) => formatAnnouncementParagraph(paragraph, index))
      .filter(Boolean),
    "",
    `${getSiteUrl()}/guide`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function postNewBlogAnnouncement({ slug, title, excerpt }) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_BLOG_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID;

  if (!token || !channelId || !slug || !title) {
    return { sent: false, skipped: true };
  }

  const blogUrl = `${getSiteUrl()}/blog/${slug}`;
  const safeExcerpt = String(excerpt || "").trim();
  const content = [
    "@everyone",
    `New blog post: **${title}**`,
    safeExcerpt ? safeExcerpt : "A new post is now live on The Monkey Type blog.",
    blogUrl,
  ].join("\n");

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: ["everyone"] },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord API error ${response.status}: ${body}`);
  }

  return { sent: true, skipped: false };
}

export async function postSiteAnnouncement(announcement) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId =
    process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID;

  if (!token || !channelId || !announcement?.version) {
    return { sent: false, skipped: true };
  }

  const content = buildSiteAnnouncementDiscordContent(announcement);

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        allowed_mentions: { parse: ["everyone"] },
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Discord API error ${response.status}: ${body}`);
  }

  const message = await response.json();

  return {
    sent: true,
    skipped: false,
    channelId,
    messageId: String(message?.id || ""),
  };
}
