"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import Footer from "@/components/Footer";
import ProfileView from "@/components/ProfileView";

const EMPTY_SOCIALS = {
  website: "",
  youtube: "",
  twitch: "",
  tiktok: "",
  instagram: "",
  github: "",
  discord: "",
};

const BEGINNER_PROGRESS_STORAGE_KEYS = [
  "tmt_beginner_progress",
  "tmt_beginner_progress_v1",
  "tmt_beginner_progress_v2",
  "tmt_beginner_progress_v3",
  "tmt_beginner_progress_v4",
];

export default function MyProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [bundle, setBundle] = useState(null);
  const [form, setForm] = useState({
    bio: "",
    title: "",
    keyboardLayout: "QWERTY",
    altLayoutAccount: "",
    socials: EMPTY_SOCIALS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearingLessonScores, setClearingLessonScores] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      setBundle(null);
      return;
    }

    let cancelled = false;
    let retryTimer = null;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/profile/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (res.status === 401) {
          if (!cancelled) {
            retryTimer = window.setTimeout(() => {
              if (!cancelled && isSignedIn) load();
            }, 700);
          }
          return;
        }

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load profile.");
        }

        if (cancelled) return;
        setBundle(data);
        setForm({
          bio: data?.profile?.bio || "",
          title: data?.profile?.title || "",
          keyboardLayout: data?.profile?.keyboardLayout || "QWERTY",
          altLayoutAccount: data?.profile?.altLayoutAccount || "",
          socials: {
            ...EMPTY_SOCIALS,
            ...(data?.profile?.socials || {}),
          },
        });
      } catch (error) {
        console.error("Profile load failed:", error);
        if (!cancelled) setBundle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, [isLoaded, isSignedIn, user?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data?.error || "Failed to save profile.");
      setBundle(data);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  function handleClearLessonScores() {
    const confirmed = window.confirm(
      "Clear all saved beginner lesson scores from this browser? This will reset your local lesson progress and cannot be undone."
    );

    if (!confirmed) return;

    setClearingLessonScores(true);
    try {
      BEGINNER_PROGRESS_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      setMessage("Beginner lesson scores cleared from this browser.");
    } catch (error) {
      setMessage("Could not clear beginner lesson scores.");
    } finally {
      setClearingLessonScores(false);
    }
  }

  if (!isLoaded || loading) {
    return (
      <main className="min-h-screen bg-ink px-4 py-8 text-white md:px-6 md:py-10">
        <div className="mx-auto max-w-6xl rounded-[1.8rem] border border-white/8 bg-[#2a2b2f] p-6 text-white/60">
          Loading profile...
        </div>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-ink px-4 py-8 text-white md:px-6 md:py-10">
        <div className="mx-auto max-w-3xl rounded-[1.8rem] border border-white/8 bg-[#2a2b2f] p-8 text-center">
          <h1 className="text-3xl text-white">Sign in to view your profile</h1>
          <p className="mt-3 text-white/60">Your personal profile, saved bests, and edit tools are available once you are signed in.</p>
          <div className="mt-6">
            <Link href="/" className="btn-primary">Back to test</Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-white/25">Profile</p>
            <h1 className="mt-2 text-4xl text-white">Your public profile</h1>
          </div>
          {bundle?.profile?.slug ? (
            <Link href={`/profile/${bundle.profile.slug}`} className="btn-secondary">
              View public page
            </Link>
          ) : null}
        </div>

        <ProfileView
          bundle={bundle}
          isOwner
          ownerActions={
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-white/55">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand/50"
                  placeholder="Tell people a bit about your typing journey."
                />
              </div>

              <Field
                label="Title badge"
                value={form.title}
                onChange={(value) => setForm((current) => ({ ...current, title: value }))}
                placeholder="Mythical"
                readonly
              />
              <Field
                label="Keyboard layout"
                value={form.keyboardLayout}
                onChange={(value) => setForm((current) => ({ ...current, keyboardLayout: value }))}
                placeholder="QWERTY"
              />
              <Field
                label="Alt layout account"
                value={form.altLayoutAccount}
                onChange={(value) => setForm((current) => ({ ...current, altLayoutAccount: value }))}
                placeholder="Optional alternate profile or layout account"
              />
              <div className="hidden md:block" />

              {Object.keys(EMPTY_SOCIALS).map((key) => (
                <Field
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={form.socials[key] || ""}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      socials: { ...current.socials, [key]: value },
                    }))
                  }
                  placeholder={key === "website" ? "https://example.com" : `Your ${key} link or handle`}
                />
              ))}

              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-sm text-white/55">{message || "Your profile updates here without changing your Clerk account settings."}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearLessonScores}
                    disabled={clearingLessonScores}
                    className="btn-secondary"
                  >
                    {clearingLessonScores ? "Clearing..." : "Clear lesson scores"}
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </div>
            </form>
          }
        />
      </div>
      <Footer />
    </main>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/55">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-brand/50"
      />
    </label>
  );
}
