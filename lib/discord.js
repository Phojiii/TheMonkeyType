function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://themonkeytype.com";

  return raw.replace(/\/+$/, "");
}

const PERSONAL_BEST_CHANNEL_ID =
  process.env.DISCORD_PERSONAL_BEST_CHANNEL_ID || "1449379045400645772";

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
    `${getSiteUrl()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function postDiscordMessage(channelId, body) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !channelId) {
    return { sent: false, skipped: true };
  }

  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord API error ${response.status}: ${text}`);
  }

  const message = await response.json();
  return {
    sent: true,
    skipped: false,
    channelId,
    messageId: String(message?.id || ""),
  };
}

export async function postNewBlogAnnouncement({ slug, title, excerpt }) {
  const channelId = process.env.DISCORD_BLOG_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID;

  if (!channelId || !slug || !title) {
    return { sent: false, skipped: true };
  }

  const blogUrl = `${getSiteUrl()}/blog/${slug}`;
  const safeExcerpt = String(excerpt || "").trim();
  const content = [
    "@everyone",
    `New blog post: **${title}**`,
    safeExcerpt ? safeExcerpt : "A new post is now live on TheMonkeyType.",
    blogUrl,
  ].join("\n");

  return postDiscordMessage(channelId, {
    content,
    allowed_mentions: { parse: ["everyone"] },
  });
}

export async function postSiteAnnouncement(announcement) {
  const channelId =
    process.env.DISCORD_ANNOUNCEMENT_CHANNEL_ID || process.env.DISCORD_CHANNEL_ID;

  if (!channelId || !announcement?.version) {
    return { sent: false, skipped: true };
  }

  return postDiscordMessage(channelId, {
    content: buildSiteAnnouncementDiscordContent(announcement),
    allowed_mentions: { parse: ["everyone"] },
  });
}

export async function postPersonalBestAnnouncement({
  profileSlug,
  username,
  discordUsername,
  duration,
  mode,
  bestWpm,
  bestAccuracy,
  previousWpm = 0,
  previousAccuracy = 0,
}) {
  if (!profileSlug || !username || !duration || !bestWpm) {
    return { sent: false, skipped: true };
  }

  const profileUrl = `${getSiteUrl()}/profile/${profileSlug}`;
  const modeLabel =
    mode === "competitive" ? "Competitive" : mode === "words" ? "Words" : "Classic";
  const categoryLabel = mode === "words" ? `${duration} words` : `${duration}s`;
  const handleLine = discordUsername ? `Discord: ${"@".concat(discordUsername)}` : null;

  const content = [
    "🏁 **New Personal Best**",
    `**Player:** ${username}`,
    handleLine,
    `**Mode:** ${modeLabel}`,
    `**Category:** ${categoryLabel}`,
    `**WPM:** ${bestWpm}${previousWpm ? ` (was ${previousWpm})` : ""}`,
    `**Accuracy:** ${bestAccuracy}%${previousAccuracy ? ` (was ${previousAccuracy}%)` : ""}`,
    `**Profile:** ${profileUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return postDiscordMessage(PERSONAL_BEST_CHANNEL_ID, {
    content,
    allowed_mentions: { parse: [] },
  });
}
