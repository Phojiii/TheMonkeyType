export default async function sitemap() {
  const baseUrl = "https://themonkeytype.com";
  return [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/stats`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
