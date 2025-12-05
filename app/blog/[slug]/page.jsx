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
    title: `${post?.title || "Blog"}`,
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

  // ✅ Convert Markdown → Sanitized HTML
  const dirty = marked(post.content || "");
  const html = sanitizeHtml(dirty, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "h3",
      "u",
      "blockquote",
      "pre",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "title", "width", "height"],
    },
  });

  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white px-4 sm:px-6 lg:px-8 py-10">
      <article className="max-w-3xl mx-auto">
        {/* ✅ COVER IMAGE */}
        {post.cover && (
          <div className="relative mb-10">
            <img
              src={post.cover}
              alt={post.title}
              className="w-full rounded-2xl object-cover max-h-[420px] shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
            <h1 className="absolute bottom-6 left-6 text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md">
              {post.title}
            </h1>
          </div>
        )}

        {/* ✅ TITLE fallback if no cover */}
        {!post.cover && (
          <h1 className="text-3xl sm:text-4xl font-extrabold text-yellow-400 mb-4 leading-tight">
            {post.title}
          </h1>
        )}

        {/* ✅ META INFO */}
        <div className="text-sm text-white/60 mb-8 flex items-center justify-between border-b border-white/10 pb-4">
          <p>
            {new Date(post.date).toLocaleDateString()} • {post.author}
          </p>
          <Link
            href="/blog"
            className="text-yellow-400 hover:text-yellow-300 transition font-semibold"
          >
            ← Back to Blog
          </Link>
        </div>

        {/* ✅ BLOG CONTENT */}
        <div
  dangerouslySetInnerHTML={{ __html: html }}
  className="max-w-none text-white/90 leading-relaxed space-y-6 text-[17px] [&_h1]:text-yellow-400 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-10 [&_h1]:mb-4 
  [&_h2]:text-yellow-300 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:border-l-4 [&_h2]:border-yellow-400/50 [&_h2]:pl-3 [&_h2]:mt-10 [&_h2]:mb-3
  [&_h3]:text-yellow-200 [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-8
  [&_p]:text-white/90 [&_p]:leading-relaxed [&_p]:my-5
  [&_strong]:text-yellow-300 [&_em]:text-yellow-200
  [&_a]:text-yellow-400 hover:[&_a]:text-yellow-300 [&_a]:underline [&_a]:underline-offset-4
  [&_ul]:list-disc [&_ul]:pl-6 [&_ul_li]:my-1 marker:[&_ul_li]:text-yellow-400
  [&_blockquote]:border-l-4 [&_blockquote]:border-yellow-400/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/80
  [&_code]:bg-[#202020] [&_code]:text-yellow-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-[#101010] [&_pre]:text-yellow-200 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
  [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-6 [&_img]:border [&_img]:border-white/10
  transition-all duration-300"
></div>


        {/* ✅ FOOTER */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center text-white/60 text-sm">
          <p>
            Written by{" "}
            <span className="text-yellow-400 font-semibold">{post.author}</span>
          </p>
          <p className="mt-2">Thanks for reading 👋</p>
        </div>
      </article>
    </main>
  );
}
