"use client";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
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

export default function LeaderboardPage() {
  const { user } = useUser();
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState("global");
  const [country, setCountry] = useState(""); // optional manual override for country scope
  const [payload, setPayload] = useState({ scores: [], meta: {}, me: null });
  const [loading, setLoading] = useState(false);

  // Human-readable subtitle reflecting current filters
  const subtitle = useMemo(() => {
    const catLabel = category === "all" ? "All durations" : `${category}s only`;
    const scopeLabel =
      scope === "country"
        ? `Your country${country ? ` (${country})` : ""}`
        : "Global";
    return `${catLabel} • ${scopeLabel}`;
  }, [category, scope, country]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ category, scope });
        if (scope === "country" && country) params.set("country", country);
        const res = await fetch(`/api/leaderboard?${params}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) {
          if (Array.isArray(data?.scores)) setPayload(data);
          else setPayload({ scores: [], meta: {}, me: null });
        }
      } catch (e) {
        console.error("Leaderboard fetch failed:", e);
        if (!cancelled) setPayload({ scores: [], meta: {}, me: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [category, scope, country]);

  const scores = payload?.scores || [];
  const effectiveCategory = payload?.meta?.category; // "all" or number

  return (
    <main className="min-h-screen bg-ink text-white px-6 py-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center max-w-6xl mx-auto mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand">Leaderboard</h1>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Duration chips */}
          <div className="flex gap-2" role="tablist" aria-label="Duration filters">
            {FILTER_OPTIONS.map((o) => {
              const active = category === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  role="tab"
                  aria-pressed={active}
                  onClick={() => setCategory(o.key)}
                  className={`px-3 py-1 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-brand ${
                    active
                      ? "bg-brand text-black font-semibold"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Scope toggle */}
          <div className="flex gap-2 ml-3" role="tablist" aria-label="Scope filters">
            {SCOPE_OPTIONS.map((o) => {
              const active = scope === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  role="tab"
                  aria-pressed={active}
                  onClick={() => setScope(o.key)}
                  className={`px-3 py-1 rounded-md text-sm transition focus:outline-none focus:ring-2 focus:ring-brand ${
                    active
                      ? "bg-brand text-black font-semibold"
                      : "bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Optional manual country override when scope=country */}
          <input
            placeholder="ISO Country (e.g. PK)"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            disabled={scope !== "country"}
            className={`ml-2 px-2 py-1 rounded border text-sm ${
              scope === "country"
                ? "bg-white/10 border-white/10"
                : "bg-white/5 border-white/5 opacity-50 cursor-not-allowed"
            }`}
          />

          <Link href="/" className="text-sm text-white/60 hover:text-white ml-3">
            ← Back
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto bg-white/5 rounded-xl border border-white/10 shadow-lg overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-white/50">Loading...</div>
        ) : scores.length === 0 ? (
          <div className="text-center py-10 text-white/50">
            No scores available yet.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-white/60">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">WPM</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Other PBs</th> {/* ✅ added header */}
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => {
                const isMe = user && s.userId === user.id;

                // Chips for other PBs (exclude current category if not "all")
                const otherPBs = (s.pbByCategory || []).filter((pb) =>
                  effectiveCategory === "all"
                    ? true
                    : pb.category !== Number(effectiveCategory)
                );

                return (
                  <tr
                    key={s.id || `${s.userId}-${s.category}` || i}
                    className={`transition ${
                      isMe ? "bg-[#E2B714]/20" : "hover:bg-white/10"
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-white/90">
                      {i + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {s.imageUrl ? (
                          <Image
                            src={s.imageUrl}
                            alt={s.username || "User"}
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10" />
                        )}
                        <span className="truncate">{s.username || "Anonymous"}</span>
                        {isMe && (
                          <span className="ml-2 text-[10px] text-brand">(You)</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-brand font-semibold">
                      {s.bestWpm}
                    </td>
                    <td className="py-3 px-4 text-sky-400">
                      {s.bestAccuracy}%
                    </td>
                    <td className="py-3 px-4 text-white/80">
                      {s.category ? `${s.category}s` : "—"}
                    </td>
                    <td className="py-3 px-4 text-white/60">
                      {s.country || "—"}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {otherPBs.length === 0 ? (
                          <span className="text-white/40 text-xs">—</span>
                        ) : (
                          otherPBs.map((pb) => (
                            <span
                              key={`${s.userId}-${pb.category}`}
                              title={`${pb.category}s • ${pb.bestWpm} WPM`}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-white/80"
                            >
                              {pb.category}s{" "}
                              <span className="text-brand font-semibold">
                                {pb.bestWpm}
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Current user rank */}
      {payload?.me && (
        <div className="max-w-5xl mx-auto mt-4 text-sm text-white/70">
          Your rank in{" "}
          {scope === "country"
            ? payload?.meta?.country || "your country"
            : "global"}{" "}
          / {category}:{" "}
          <span className="text-brand font-semibold">#{payload.me.rank}</span>{" "}
          out of {payload.me.total}
        </div>
      )}
      <Footer />
    </main>
  );
}
