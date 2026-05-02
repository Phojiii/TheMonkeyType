"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Footer from "@/components/Footer";

const FILTER_OPTIONS = [
  { key: "all", label: "All" },
  { key: "15", label: "15s" },
  { key: "30", label: "30s" },
  { key: "60", label: "60s" },
  { key: "120", label: "120s" },
];

const SCOPE_OPTIONS = [
  { key: "global", label: "Global" },
  { key: "country", label: "My Country" },
];

const MODE_OPTIONS = [
  { key: "classic", label: "Classic" },
  { key: "competitive", label: "Competitive" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  const [mode, setMode] = useState("classic");
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState("global");
  const [country, setCountry] = useState("");
  const [payload, setPayload] = useState({ scores: [], meta: {}, me: null });
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [challenging, setChallenging] = useState("");

  const subtitle = useMemo(() => {
    const catLabel = category === "all" ? "All durations" : `${category}s only`;
    const scopeLabel = scope === "country" ? `Your country${country ? ` (${country})` : ""}` : "Global";
    const modeLabel = mode === "competitive" ? "Competitive" : "Classic";
    return `${catLabel} | ${scopeLabel} | ${modeLabel}`;
  }, [category, scope, country, mode]);

  useEffect(() => {
    if (!isSignedIn) return;

    const ping = async () => {
      try {
        await fetch("/api/presence", { method: "POST" });
      } catch {}
    };

    ping();
    const timer = setInterval(ping, 25000);
    return () => clearInterval(timer);
  }, [isSignedIn]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ category, scope, mode });
        if (scope === "country" && country) params.set("country", country);

        const res = await fetch(`/api/leaderboard?${params}`, { cache: "no-store" });
        const data = await res.json();

        if (!cancelled) {
          setPayload(Array.isArray(data?.scores) ? data : { scores: [], meta: {}, me: null });
        }
      } catch (error) {
        console.error("Leaderboard fetch failed:", error);
        if (!cancelled) setPayload({ scores: [], meta: {}, me: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [category, scope, country, mode]);

  const scores = Array.isArray(payload?.scores) ? payload.scores : [];
  const effectiveCategory = payload?.meta?.category;

  async function handleChallenge(row) {
    if (!row?.userId || challenging) return;

    setChallenging(row.userId);
    try {
      const duration = Number(category === "all" ? row.category || 60 : category);
      const res = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opponentUserId: row.userId, duration }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.challengeId) {
          router.push(`/challenge/${data.challengeId}`);
          return;
        }
        throw new Error(data?.error || "Failed to create challenge");
      }

      router.push(`/challenge/${data.challengeId}`);
    } catch (error) {
      alert(error.message || "Failed to create challenge");
    } finally {
      setChallenging("");
    }
  }

  async function handleUpdateRecords() {
    if (!isSignedIn) return;
    setUpdating(true);

    const keys = [
      { key: "tmt_stats_classic", mode: "classic" },
      { key: "tmt_stats_competitive", mode: "competitive" },
    ];

    try {
      for (const entry of keys) {
        const raw = JSON.parse(localStorage.getItem(entry.key) || "[]");
        if (!Array.isArray(raw)) continue;

        const bestByDuration = {};

        for (const record of raw) {
          const duration = Number(record.duration);
          if (![15, 30, 60, 120].includes(duration)) continue;

          const wpm = Math.round(Number(record.wpm) || 0);
          const acc = Math.round(Number(record.accuracy) || 0);

          if (!bestByDuration[duration]) {
            bestByDuration[duration] = { wpm, acc };
          } else {
            bestByDuration[duration].wpm = Math.max(bestByDuration[duration].wpm, wpm);
            bestByDuration[duration].acc = Math.max(bestByDuration[duration].acc, acc);
          }
        }

        for (const [duration, value] of Object.entries(bestByDuration)) {
          await fetch("/api/saveScore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              mode: entry.mode,
              duration: Number(duration),
              bestWpm: value.wpm,
              bestAccuracy: value.acc,
            }),
          });
        }
      }

      alert("Records updated successfully");
    } catch (error) {
      console.error("Update records failed:", error);
      alert("Failed to update records");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-white">
      <header className="mx-auto mb-4 flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand">Leaderboard</h1>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>

        <button
          onClick={handleUpdateRecords}
          disabled={!isSignedIn || updating}
          className={`text-sm ${!isSignedIn ? "btn-secondary" : "btn-primary"}`}
        >
          {updating ? "Updating..." : "Update Records"}
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2" role="tablist" aria-label="Mode filters">
            {MODE_OPTIONS.map((option) => {
              const active = mode === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-pressed={active}
                  onClick={() => setMode(option.key)}
                  className={`text-sm ${active ? "btn-tab-active" : "btn-tab"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="ml-1 flex gap-2" role="tablist" aria-label="Duration filters">
            {FILTER_OPTIONS.map((option) => {
              const active = category === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-pressed={active}
                  onClick={() => setCategory(option.key)}
                  className={`text-sm ${active ? "btn-tab-active" : "btn-tab"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="ml-1 flex gap-2" role="tablist" aria-label="Scope filters">
            {SCOPE_OPTIONS.map((option) => {
              const active = scope === option.key;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-pressed={active}
                  onClick={() => setScope(option.key)}
                  className={`text-sm ${active ? "btn-tab-active" : "btn-tab"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <input
            placeholder="ISO Country (e.g. PK)"
            value={country}
            onChange={(event) => setCountry(event.target.value.toUpperCase())}
            disabled={scope !== "country"}
            className={`ml-2 rounded-full border px-3 py-2 text-sm ${
              scope === "country"
                ? "border-white/10 bg-white/10"
                : "cursor-not-allowed border-white/5 bg-white/5 opacity-50"
            }`}
          />

          <Link href="/" className="btn-ghost ml-1 text-sm">
            Back
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl overflow-x-auto rounded-xl border border-white/10 bg-white/5 shadow-lg">
        {!isLoaded ? (
          <div className="py-8 text-center text-white/50">Loading user...</div>
        ) : loading ? (
          <div className="py-8 text-center text-white/50">Loading...</div>
        ) : scores.length === 0 ? (
          <div className="py-10 text-center text-white/50">No scores available yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-white/60">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">WPM</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Other PBs</th>
                {mode === "competitive" && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {scores.map((score, index) => {
                const isMe = !!(user && score.userId === user.id);
                const online = !!score.lastSeenAt && Date.now() - new Date(score.lastSeenAt).getTime() < 45000;
                const otherPBs = (score.pbByCategory || []).filter((pb) =>
                  effectiveCategory === "all" ? true : pb.category !== Number(effectiveCategory)
                );

                return (
                  <tr
                    key={score.id || `${score.userId}-${score.category}-${index}`}
                    className={`transition ${isMe ? "bg-[#E2B714]/20" : "hover:bg-white/10"}`}
                  >
                    <td className="px-4 py-3 font-semibold text-white/90">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          title={online ? "Online" : "Offline"}
                          className={`inline-block h-2.5 w-2.5 rounded-full ${online ? "bg-green-400" : "bg-white/20"}`}
                        />
                        {score.imageUrl ? (
                          <Image
                            src={score.imageUrl}
                            alt={score.username || "User"}
                            width={32}
                            height={32}
                            className="rounded-full"
                            style={{ width: "32px", height: "32px", objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-white/10" />
                        )}
                        <span className="max-w-[180px] truncate">{score.username || "Anonymous"}</span>
                        {isMe && <span className="ml-1 text-[10px] text-brand">(You)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand">{Number(score.bestWpm || 0)}</td>
                    <td className="px-4 py-3 text-sky-400">{Number(score.bestAccuracy || 0)}%</td>
                    <td className="px-4 py-3 text-white/80">{score.category ? `${score.category}s` : "-"}</td>
                    <td className="px-4 py-3 text-white/60">{score.country || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {otherPBs.length === 0 ? (
                          <span className="text-xs text-white/40">-</span>
                        ) : (
                          otherPBs.map((pb) => (
                            <span
                              key={`${score.userId}-${pb.category}`}
                              title={`${pb.category}s | ${pb.bestWpm} WPM`}
                              className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] text-white/80"
                            >
                              {pb.category}s <span className="font-semibold text-brand">{pb.bestWpm}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    {mode === "competitive" && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleChallenge(score)}
                          disabled={!online || isMe || !isSignedIn || challenging === score.userId}
                          title={
                            !isSignedIn
                              ? "Sign in to challenge"
                              : isMe
                                ? "You cannot challenge yourself"
                                : online
                                  ? "Challenge this user"
                                  : "User is offline"
                          }
                          className={`text-xs ${
                            !isSignedIn || !online || isMe ? "btn-secondary" : "btn-primary"
                          }`}
                        >
                          {challenging === score.userId ? "Sending..." : "Challenge"}
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {payload?.me && (
        <div className="mx-auto mt-4 max-w-6xl text-sm text-white/70">
          Your rank in {scope === "country" ? payload?.meta?.country || "your country" : "global"} / {category} / {mode}:{" "}
          <span className="font-semibold text-brand">#{payload.me.rank}</span> out of {payload.me.total}
        </div>
      )}

      <Footer />
    </main>
  );
}
