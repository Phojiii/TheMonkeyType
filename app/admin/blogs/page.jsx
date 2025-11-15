"use client";
import { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { ADMINS } from "@/lib/admins";
import dynamic from "next/dynamic";
import { MdCloudUpload } from "react-icons/md";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function AdminBlogPage() {
  const { user, isLoaded } = useUser();
  const [form, setForm] = useState({
    title: "",
    description: "",
    cover: "",
    content: "",
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Wait for user state to load
  if (!isLoaded)
    return <div className="text-center text-white">Loading...</div>;

  // Unauthenticated user
  if (!user)
    return (
      <main className="min-h-screen bg-ink text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg">
            Please sign in to access the Admin Panel
          </p>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-brand text-ink rounded-md">
              Sign In
            </button>
          </SignInButton>
        </div>
      </main>
    );

  // Check admin permissions
  const isAdmin = ADMINS.includes(user.id);
  if (!isAdmin)
    return (
      <main className="min-h-screen bg-ink text-white flex items-center justify-center">
        <p className="text-red-400 text-lg">Access Denied - Admins Only</p>
      </main>
    );

  // 🖼️ Handle cover image upload
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

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dn1t9j54l/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        setForm((prev) => ({ ...prev, cover: data.secure_url }));
        setMessage("✅ Image uploaded successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  // 📝 Handle blog submit
  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.content) {
      alert("⚠️ Please fill in Title and Content before publishing.");
      return;
    }

    setUploading(true);
    setMessage("Publishing blog...");

    try {
      const dataToSend = new FormData();
      dataToSend.append("title", form.title);
      dataToSend.append("excerpt", form.description || "");
      dataToSend.append("content", form.content);
      if (form.cover) dataToSend.append("cover", form.cover);

      const res = await fetch("/api/admin/newblog", {
        method: "POST",
        body: dataToSend,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to publish blog.");

      setMessage("✅ Blog Published Successfully!");
      alert("✅ Blog Published Successfully!");
      window.location.href = `/blog/${data.slug}`;
    } catch (err) {
      console.error("Submit error:", err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  // --- UI ---
  return (
    <main className="min-h-screen bg-ink text-white px-6 py-10">
      <section className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-6">Admin Blog Panel</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
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

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm mb-1">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short description or summary"
              className="w-full rounded-md bg-white/10 border border-white/10 px-3 py-2"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-white/80 text-sm mb-1 flex items-center gap-2">
              Cover Image <MdCloudUpload className="text-lg" />
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-white file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-ink hover:file:bg-yellow-400"
            />{/* Hidden input that carries Cloudinary URL */}
            <input type="hidden" name="cover" value={form.cover || ""} />
            {uploading && (
              <p className="text-sm text-white/50 mt-2">Uploading...</p>
            )}
            {form.cover && (
              <img
                src={form.cover}
                alt="Cover Preview"
                className="mt-3 rounded-lg border border-white/10 max-h-60 object-cover"
              />
            )}
          </div>

          {/* Markdown Content */}
          <div data-color-mode="dark">
            <label className="block text-white/80 text-sm mb-2">
              Markdown Content
            </label>
            <MDEditor
              height={400}
              value={form.content}
              onChange={(val) => setForm((f) => ({ ...f, content: val || "" }))}
              preview="edit"
              textareaProps={{
                placeholder:
                  "# Write your post here...\n\nYou can use markdown syntax!",
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2 rounded-md bg-brand text-ink font-semibold hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {uploading ? "Publishing..." : "Publish Blog"}
          </button>
        </form>

        {message && <p className="mt-4 text-white/70">{message}</p>}
      </section>
    </main>
  );
}
