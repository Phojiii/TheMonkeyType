'use client';
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useUser } from "@clerk/nextjs";
import Footer from "@/components/Footer";

const KEY = "tmt_stats";

export default function StatsPage() {
  const [raw, setRaw] = useState([]);
  const [filter, setFilter] = useState("all"); // all | 15 | 30 | 60 | 120
  const [range, setRange] = useState("7d");    // '12h' | '24h' | '7d' | '30d'
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
    const normalized = (Array.isArray(stored) ? stored : []).map((d) => {
      const dur = Number(d?.duration);
      return {
        ...d,
        duration: Number.isFinite(dur) ? dur : null,
        wpm: Number(d?.wpm) || 0,
        accuracy: Number(d?.accuracy) || 0,
        words: Number(d?.words) || 0,
        ts: new Date(d.date).getTime(), // numeric timestamp for charting
      };
    });
    setRaw(normalized);
    gsap.fromTo('.stats-stagger', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 });
  }, []);

  // duration filter (left controls)
  const dataByDuration = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : [];
    if (filter === "all") return arr;
    const want = Number(filter);
    return arr.filter((d) => d.duration === want);
  }, [raw, filter]);

  // chart time-range filter
  const chartData = useMemo(() => {
    if (!dataByDuration.length) return [];
    const now = Date.now();
    const rangeMs = ({
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d' : 7  * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    })[range] || (7 * 24 * 60 * 60 * 1000);

    const from = now - rangeMs;
    const within = dataByDuration.filter(d => d.ts >= from && d.ts <= now);

    // Sort by time ascending so the line draws properly
    return within.sort((a, b) => a.ts - b.ts);
  }, [dataByDuration, range]);

  // ---- aggregates (computed on duration-filtered data, not range-filtered)
  const totals = useMemo(() => {
    const data = dataByDuration;
    if (!data.length) return null;
    const wpmVals   = data.map(d => d.wpm);
    const accVals   = data.map(d => d.accuracy);
    const wordsVals = data.map(d => d.words);

    const bestWpm    = Math.max(...wpmVals);
    const bestAcc    = Math.max(...accVals);
    const avgWpm     = wpmVals.reduce((a,b)=>a+b,0) / wpmVals.length;
    const totalWords = wordsVals.reduce((a,b)=>a+b,0);
    const totalTests = data.length;

    return { bestWpm, bestAcc, avgWpm, totalWords, totalTests };
  }, [dataByDuration]);

  const clearStats = () => {
    localStorage.removeItem(KEY);
    setRaw([]);
  };
  
  // --- sync best score to server when signed-in and a single duration is selected
  useEffect(() => {
    if (!isSignedIn || !totals) return;
    if (!filter || filter === "all") return; // require specific duration

    const duration = Number(filter);
    const ALLOWED = [15, 30, 60, 120];
    if (!ALLOWED.includes(duration)) return;

    const payload = {
      bestWpm: Math.round(totals.bestWpm),
      bestAccuracy: Math.round(totals.bestAcc),
      duration,
    };

    (async () => {
      try {
        const res = await fetch("/api/saveScore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // <-- ensure cookies are sent so getAuth() works
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("SaveScore failed:", res.status, text);
        }
      } catch (err) {
        console.error("SaveScore request error:", err);
      }
    })();
  }, [isSignedIn, totals, filter]);

  const removeEntry = (iFromEnd) => {
    const arr = Array.isArray(raw) ? [...raw] : [];
    const idx = arr.length - 1 - iFromEnd;
    if (idx >= 0) {
      arr.splice(idx, 1);
      localStorage.setItem(KEY, JSON.stringify(arr));
      setRaw(arr);
    }
  };

  // helpers to format ticks/tooltips based on chosen range
  const formatTick = (ts) => {
    const d = new Date(ts);
    if (range === '12h' || range === '24h') {
      // show time
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // show day + time
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatLabel = (ts) => new Date(ts).toLocaleString();
  
  return (
    <main className="min-h-screen bg-ink text-white px-6 py-10">
      <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto stats-stagger">
        <h1 className="text-2xl font-bold text-brand">Your Typing Stats</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="text-white/70 hover:text-white">← Back to Test</Link>
          <Link href="/stats" className="text-white/70 hover:text-white">Refresh</Link>
        </nav>
      </header>

      {/* Filters + Actions */}
      <section className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 stats-stagger">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/60">Session length:</span>
          {["all", 15, 30, 60, 120].map(f => (
            <button
              key={f}
              onClick={() => setFilter(String(f))}
              className={
                "px-3 py-1 rounded-md transition " +
                (String(filter) === String(f)
                  ? "bg-brand text-ink shadow-[0_0_10px_rgba(226,183,20,0.35)]"
                  : "bg-white/10 text-white/80 hover:bg-white/15")
              }
            >
              {f === "all" ? "All" : `${f}s`}
            </button>
          ))}
        </div>

        {/* NEW: Chart range */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/60">Chart range:</span>
          {["12h", "24h", "7d", "30d"].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={
                "px-3 py-1 rounded-md transition " +
                (range === r
                  ? "bg-white/90 text-ink"
                  : "bg-white/10 text-white/80 hover:bg-white/15")
              }
            >
              {r}
            </button>
          ))}
        </div>

        <button
          onClick={clearStats}
          className="px-3 py-1.5 rounded-md bg-red-600/70 hover:bg-red-600 transition text-sm"
        >
          Clear History
        </button>
      </section>

      {/* Badges */}
      {totals ? (
        <section className="max-w-6xl mx-auto grid md:grid-cols-5 gap-4 stats-stagger">
          <Badge title="Best WPM" value={Math.round(totals.bestWpm)} accent="brand" />
          <Badge title="Best Accuracy" value={`${totals.bestAcc.toFixed(1)}%`} accent="sky" />
          <Badge title="Avg WPM" value={Math.round(totals.avgWpm)} accent="slate" />
          <Badge title="Total Tests" value={totals.totalTests} accent="zinc" />
          <Badge title="Total Words" value={Math.round(totals.totalWords)} accent="amber" />
        </section>
      ) : (
        <div className="text-center text-white/60 mt-20 stats-stagger">
          No tests recorded yet.<br/>Complete a test to see your stats here.
        </div>
      )}

      {/* Chart */}
      <section className="max-w-6xl mx-auto mt-8 bg-white/5 rounded-xl p-6 border border-white/10 stats-stagger">
        <h2 className="text-lg font-semibold mb-4">Performance Over Time ({range})</h2>
        <div className="w-full h-72">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              No data in selected range.
            </div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  tickFormatter={formatTick}
                  stroke="#ccc"
                />
                {/* Y axis is numeric (WPM/Accuracy); time is on X axis */}
                <YAxis stroke="#ccc" />
                <Tooltip
                  contentStyle={{ background: "#222", border: "none", color: "#fff" }}
                  labelFormatter={formatLabel}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  name="WPM"
                  stroke="#E2B714"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Table */}
      {dataByDuration.length > 0 && (
        <section className="max-w-6xl mx-auto mt-8 bg-white/5 rounded-xl p-6 border border-white/10 overflow-x-auto stats-stagger">
          <h2 className="text-lg font-semibold mb-4">Results ({filter === "all" ? "All" : `${filter}s`})</h2>
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-white/70 border-b border-white/10">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Duration</th>
                <th className="py-2 px-3">WPM</th>
                <th className="py-2 px-3">Accuracy</th>
                <th className="py-2 px-3">Words</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataByDuration.slice().reverse().map((d, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2 px-3">{new Date(d.ts).toLocaleString()}</td>
                  <td className="py-2 px-3">{d.duration != null ? `${d.duration}s` : "—"}</td>
                  <td className="py-2 px-3 text-brand">{d.wpm}</td>
                  <td className="py-2 px-3 text-sky-400">{d.accuracy}%</td>
                  <td className="py-2 px-3">{d.words}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => removeEntry(i)}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <Footer />
    </main>
  );
}

/* --- UI bits --- */
function Badge({ title, value, accent = "brand" }) {
  const accents = {
    brand: "text-[#323437] bg-[#E2B714] shadow-[0_0_16px_rgba(226,183,20,0.25)]",
    sky: "text-sky-900 bg-sky-300/90",
    slate: "text-slate-900 bg-slate-300/90",
    zinc: "text-zinc-900 bg-zinc-300/90",
    amber: "text-amber-900 bg-amber-300/90",
  };
  return (
    <div className="rounded-xl p-4 bg-white/5 border border-white/10">
      <div className="text-white/60 text-xs">{title}</div>
      <div className={"mt-1 inline-block px-3 py-1 rounded-md font-semibold " + (accents[accent] || accents.brand)}>
        {value}
      </div>
    </div>
  );
}
