"use client";
import { useEffect, useMemo, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { ADMINS } from "@/lib/admins";
import dynamic from "next/dynamic";
import { MdCloudUpload } from "react-icons/md";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const EMPTY_FORM = {
  title: "",
  author: "TheMonkeyType Team",
  description: "",
  cover: "",
  content: "",
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function adminFetch(input, init = {}, retries = 1) {
  const response = await fetch(input, {
    credentials: "include",
    cache: "no-store",
    ...init,
  });

  if ((response.status === 401 || response.status === 403) && retries > 0) {
    await delay(600);
    return adminFetch(input, init, retries - 1);
  }

  return response;
}

export default function AdminBlogPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [form, setForm] = useState(EMPTY_FORM);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingSlug, setEditingSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const isEditing = useMemo(() => !!editingSlug, [editingSlug]);

  useEffect(() => {
    if (!isLoaded || !user || !ADMINS.includes(user.id)) return;
    loadPosts();
  }, [isLoaded, user]);

  async function loadPosts() {
    setLoadingPosts(true);
    try {
      const res = await adminFetch("/api/admin/blogs");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load blogs");
      setPosts(Array.isArray(data?.posts) ? data.posts : []);
    } catch (error) {
      console.error(error);
      setMessage(`Failed to load blogs: ${error.message}`);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function startEdit(slug) {
    setSaving(true);
    setMessage("Loading blog...");
    try {
      const res = await adminFetch(`/api/admin/blogs?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load blog");

      setEditingSlug(data.post.slug);
      setForm({
        title: data.post.title || "",
        author: data.post.author || "TheMonkeyType Team",
        description: data.post.excerpt || "",
        cover: data.post.cover || "",
        content: data.post.content || "",
      });
      setMessage(`Editing: ${data.post.title}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setMessage(`Failed to load blog: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  function resetEditor() {
    setEditingSlug("");
    setForm(EMPTY_FORM);
    setMessage("");
  }

  if (!isLoaded) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-ink text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">Please sign in to access the Admin Panel</p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-brand text-ink rounded-md">Sign In</button>
          </SignInButton>
        </div>
      </main>
    );
  }

  const isAdmin = ADMINS.includes(user.id);
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-ink text-white flex items-center justify-center">
        <p className="text-red-400 text-lg">Access Denied - Admins Only</p>
      </main>
    );
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "themonkeytype_blog");
      formData.append("folder", "blog");

      const res = await fetch("https://api.cloudinary.com/v1_1/dn1t9j54l/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.secure_url) throw new Error("Upload failed");

      setForm((prev) => ({ ...prev, cover: data.secure_url }));
      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isLoaded || !isSignedIn) {
      setMessage("Your session is still loading. Please try again.");
      return;
    }

    if (!form.title || !form.content) {
      alert("Please fill in Title and Content before saving.");
      return;
    }

    setSaving(true);
    setMessage(isEditing ? "Saving changes..." : "Publishing blog...");

    try {
      const dataToSend = new FormData();
      dataToSend.append("title", form.title);
      dataToSend.append("author", form.author || "TheMonkeyType Team");
      dataToSend.append("excerpt", form.description || "");
      dataToSend.append("content", form.content);
      if (form.cover) dataToSend.append("cover", form.cover);

      const url = isEditing ? "/api/admin/blogs" : "/api/admin/newblog";
      const method = isEditing ? "PUT" : "POST";
      if (isEditing) dataToSend.append("originalSlug", editingSlug);

      const res = await adminFetch(url, {
        method,
        body: dataToSend,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save blog.");

      if (isEditing) {
        setMessage("Blog updated successfully.");
        setEditingSlug(data.slug);
        await loadPosts();
      } else {
        setMessage("Blog published successfully.");
        alert("Blog Published Successfully!");
        window.location.href = `/blog/${data.slug}`;
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage(error.message || "Failed to save blog.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-white px-6 py-10">
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand">Admin Blog Panel</h1>
            <p className="text-white/60 mt-1">
              {isEditing ? `Editing ${editingSlug}` : "Create a new post or update an existing one."}
            </p>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={resetEditor}
              className="px-4 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              Cancel Editing
            </button>
          )}
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold">Existing Blogs</h2>
            <button
              type="button"
              onClick={loadPosts}
              className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 transition text-sm"
            >
              {loadingPosts ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loadingPosts ? (
            <p className="text-white/50 text-sm">Loading blogs...</p>
          ) : posts.length === 0 ? (
            <p className="text-white/50 text-sm">No blogs found.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.slug}
                  className="rounded-xl border border-white/10 bg-black/20 p-4 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{post.title}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {post.slug} | {post.author || "TheMonkeyType Team"}
                    </p>
                    {post.excerpt && (
                      <p className="text-sm text-white/60 mt-2 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => startEdit(post.slug)}
                      className="px-3 py-2 rounded-md bg-brand text-ink font-semibold hover:bg-yellow-400 transition text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-white/80 text-sm mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Enter blog title"
                className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1">Author</label>
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Author name"
                className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-1">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Short description or summary"
              className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2"
            />
          </div>

          <div>
            <label className="text-white/80 text-sm mb-1 flex items-center gap-2">
              Cover Image <MdCloudUpload className="text-lg" />
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-white file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-ink hover:file:bg-yellow-400"
            />
            <input type="hidden" name="cover" value={form.cover || ""} />
            {uploading && <p className="text-sm text-white/50 mt-2">Uploading...</p>}
            {form.cover && (
              <img
                src={form.cover}
                alt="Cover Preview"
                className="mt-3 rounded-lg border border-white/10 max-h-60 object-cover"
              />
            )}
          </div>

          <div data-color-mode="dark">
            <label className="block text-white/80 text-sm mb-2">Markdown Content</label>
            <MDEditor
              height={420}
              value={form.content}
              onChange={(val) => setForm((prev) => ({ ...prev, content: val || "" }))}
              preview="edit"
              textareaProps={{
                placeholder: "# Write your post here...\n\nYou can use markdown syntax!",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="px-5 py-2 rounded-md bg-brand text-ink font-semibold hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {saving || uploading
              ? isEditing
                ? "Saving..."
                : "Publishing..."
              : isEditing
              ? "Save Changes"
              : "Publish Blog"}
          </button>
        </form>

        {message && <p className="text-white/70">{message}</p>}
      </section>
    </main>
  );
}
