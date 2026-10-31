import { getAllPosts } from "@/lib/blog";
import { LOCALE_PATHS } from "@/lib/locales";

export default async function sitemap() {
  const baseUrl = "https://themonkeytype.com";
  const posts = await getAllPosts();

  const routes = [
    { url: `${baseUrl}/`, changeFrequency: "yearly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "yearly", priority: 0.9 },
    { url: `${baseUrl}/guide`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${baseUrl}/leaderboard`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/stats`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/security-policy`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/release-notes`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const localizedRoutes = Object.values(LOCALE_PATHS)
    .filter(Boolean)
    .map((locale) => ({
      url: `${baseUrl}/${locale}`,
      changeFrequency: "yearly",
      priority: 0.8,
    }));

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date || Date.now()),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...routes, ...localizedRoutes, ...blogRoutes].map((route) => ({
    url: route.url,
    lastModified: route.lastModified || new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
