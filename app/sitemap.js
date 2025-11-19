import { getAllPosts } from "@/lib/blog";

export default async function sitemap() {
  const baseUrl = "https://themonkeytype.com";

  // ✅ Fetch all blog posts dynamically
  const posts = await getAllPosts();

  // ✅ Core static pages
  const routes = [
    { url: `${baseUrl}/`, changeFrequency: "yearly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "yearly", priority: 0.9 },
    { url: `${baseUrl}/leaderboard`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/stats`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  // ✅ Add dynamic blog URLs
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date || Date.now()),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...routes, ...blogRoutes].map((route) => ({
    url: route.url,
    lastModified: route.lastModified || new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
