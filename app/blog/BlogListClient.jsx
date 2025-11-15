"use client";
import Link from "next/link";
import { useState } from "react";

export default function BlogListClient({ posts, isAdmin }) {
  const [deleting, setDeleting] = useState({});

  async function handleDelete(slug) {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    setDeleting((prev) => ({ ...prev, [slug]: true }));
    try {
      const res = await fetch(`/api/admin/deleteblog?slug=${slug}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        alert("✅ Blog deleted successfully!");
        window.location.reload();
      } else {
        alert(`❌ Failed to delete: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting blog.");
    } finally {
      setDeleting((prev) => ({ ...prev, [slug]: false }));
    }
  }

  return (
    <ul className="divide-y divide-white/10">
      {posts.map((post) => (
        <li key={post.slug} className="py-4 relative group">
          <Link href={`/blog/${post.slug}`}>
            <h2 className="text-xl font-semibold text-brand group-hover:underline">
              {post.title}
            </h2>
            <p className="text-sm text-white/60 mt-1">
              {new Date(post.date).toLocaleDateString()} • {post.author}
            </p>
            <p className="text-white/70 mt-2">{post.excerpt}</p>
          </Link>

          {/* 🗑️ Admin-only Delete Button */}
          {isAdmin && (
            <button
              onClick={() => handleDelete(post.slug)}
              disabled={deleting[post.slug]}
              className="absolute top-4 right-0 text-xs bg-red-600/80 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
            >
              {deleting[post.slug] ? "Deleting..." : "Delete"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
