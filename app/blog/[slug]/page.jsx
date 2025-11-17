import { getAllPosts, getPostBySlug } from "@/lib/blog";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

export const dynamic = "force-dynamic";

// ✅ Static generation of slugs
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// ✅ Metadata for SEO
export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  return {
    title: `${post?.title || "Blog"} | TheMonkeyType Blog`,
    description: post?.excerpt || "",
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return (
      <main className="min-h-screen bg-ink text-white flex items-center justify-center">
        <p className="text-lg text-white/70">Post not found.</p>
      </main>
    );
  }



// Convert markdown → HTML → sanitized HTML
const dirty = marked(post.content || "");
const html = sanitizeHtml(dirty, {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt"],
  },
});


  return (
    <main className="min-h-screen bg-ink text-white px-6 py-12">
      <article className="max-w-4xl mx-auto prose prose-invert prose-img:rounded-lg prose-pre:bg-[#1e1e1e] prose-pre:text-white prose-headings:text-brand">
        {/* ✅ Cover Image */}
        {post.cover && (
          <img
            src={post.cover}
            alt={post.title}
            className="w-full rounded-xl mb-8 shadow-lg border border-white/10"
          />
        )}

        {/* ✅ Title */}
        <h1>{post.title}</h1>

        {/* ✅ Author + Date */}
        <p className="text-sm text-white/60 mb-8">
          {new Date(post.date).toLocaleDateString()} • {post.author}
        </p>

        {/* ✅ Render Markdown as HTML */}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>

      {/* ✅ Back link */}
      <div className="max-w-4xl mx-auto mt-10">
        <Link
          href="/blog"
          className="text-brand hover:underline text-sm font-semibold"
        >
          ← Back to Blog
        </Link>
      </div>
    </main>
  );
}
