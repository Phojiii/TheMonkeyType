function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://themonkeytype.com";

  return raw.replace(/\/+$/, "");
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
