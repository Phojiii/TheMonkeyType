import { getAllPosts } from "@/lib/blog";
import BlogListClient from "./BlogListClient";
import { currentUser } from "@clerk/nextjs/server";
import { ADMINS } from "@/lib/admins";

export const metadata = {
  title: "Blog | TheMonkeyType",
  description: "Typing guides, updates, and insights from TheMonkeyType team.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const user = await currentUser();
  const isAdmin = user && ADMINS.includes(user.id);

  return (
    <main className="min-h-screen bg-ink text-white px-6 py-12">
      <section className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-brand">TheMonkeyType Blog</h1>
        <p className="text-white/70">
          Learn typing techniques, read community updates, and explore new features.
        </p>

        {/* Pass posts + admin flag to client component */}
        <BlogListClient posts={posts} isAdmin={isAdmin} />
      </section>
    </main>
  );
}
