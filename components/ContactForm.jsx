"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";

const categories = [
  "General Support",
  "Account Help",
  "Bug Report",
  "Feature Request",
  "Challenge / Leaderboard Issue",
  "Partnership / Business",
  "Other",
];

export default function ContactForm() {
  const { user, isLoaded, isSignedIn } = useUser();
  const defaultUsername = useMemo(
    () => user?.username || user?.fullName || "",
    [user?.fullName, user?.username]
  );

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: user?.primaryEmailAddress?.emailAddress || "",
    category: categories[0],
    message: "",
  });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState({ type: "", text: "" });

  const effectiveUsername = form.username || defaultUsername;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setResult({ type: "", text: "" });

    try {
      const payload = new FormData();
      payload.append("fullName", form.fullName);
      payload.append("email", form.email);
      payload.append("category", form.category);
      payload.append("message", form.message);
      if (isSignedIn && effectiveUsername) {
        payload.append("username", effectiveUsername);
      }
      if (image) {
        payload.append("image", image);
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        body: payload,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) {
        throw new Error(data?.error || "Failed to send your message.");
      }

      setResult({ type: "success", text: data?.message || "Your message has been sent successfully." });
      setForm((current) => ({
        ...current,
        fullName: "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        category: categories[0],
        message: "",
        username: defaultUsername,
      }));
      setImage(null);
      const fileInput = document.getElementById("contact-image-input");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      setResult({ type: "error", text: error.message || "Failed to send your message." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brand/75">Contact Form</p>
          <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Send a message directly to the team</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            Share support requests, bug reports, feature ideas, or general questions. You do not need to be signed in to submit this form.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/55">
          Optional image support is included for screenshots and bug reports.
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field
          label="Full Name"
          value={form.fullName}
          onChange={(value) => updateField("fullName", value)}
          placeholder="Your full name"
          required
        />

        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => updateField("email", value)}
          placeholder="you@example.com"
          required
        />

        {isLoaded && isSignedIn ? (
          <Field
            label="User Name"
            value={effectiveUsername}
            onChange={(value) => updateField("username", value)}
            placeholder="Your signed-in username"
          />
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm text-white/55">Category</span>
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand/50"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-white/55">Image</span>
          <input
            id="contact-image-input"
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
            className="w-full rounded-2xl border border-dashed border-white/12 bg-black/20 px-4 py-3 text-sm text-white/65 file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-black hover:file:brightness-105"
          />
          <p className="mt-2 text-xs text-white/45">Optional. Max file size: 8MB.</p>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-white/55">Message</span>
          <textarea
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            rows={7}
            required
            placeholder="Tell us what happened, what you need help with, or what you would like to suggest."
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand/50"
          />
        </label>
      </div>

      {result.text ? (
        <div
          className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
            result.type === "success"
              ? "border-brand/30 bg-brand/10 text-white/85"
              : "border-red-400/30 bg-red-500/10 text-red-100"
          }`}
        >
          {result.text}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          Submissions are delivered to the team through Discord so we can review them faster.
        </p>
        <button type="submit" disabled={submitting} className="btn-primary min-w-[12rem]">
          {submitting ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, placeholder, required = false, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/55">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand/50"
      />
    </label>
  );
}
