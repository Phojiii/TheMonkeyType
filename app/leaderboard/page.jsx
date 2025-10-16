'use client';
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function LeaderboardPage() {
  const { user } = useUser();
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();

        // ✅ Ensure data is an array
        if (Array.isArray(data)) setScores(data);
        else {
          console.error("Leaderboard API returned non-array:", data);
          setScores([]);
        }
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
        setScores([]);
      }
    }
    fetchScores();
  }, []);

  return (
    <main className="min-h-screen bg-ink text-white px-6 py-10">
      <header className="flex justify-between items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-brand">Global Leaderboard</h1>
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← Back
        </Link>
      </header>

      <section className="max-w-4xl mx-auto bg-white/5 rounded-xl border border-white/10 shadow-lg overflow-hidden">
        {scores.length === 0 ? (
          <div className="text-center py-10 text-white/50">No scores available yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/10 text-white/60">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">WPM</th>
                <th className="py-3 px-4">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => {
                const isMe = user && s.userId === user.id;
                return (
                  <tr
                    key={s.userId || i}
                    className={`transition ${isMe ? "bg-[#E2B714]/20" : "hover:bg-white/10"}`}
                  >
                    <td className="py-3 px-4 font-semibold text-white/90">{i + 1}</td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      {s.imageUrl ? (
                        <Image
                          src={s.imageUrl}
                          alt={s.username}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                      )}
                      <span className="truncate">{s.username}</span>
                      {isMe && <span className="ml-2 text-[10px] text-brand">(You)</span>}
                    </td>
                    <td className="py-3 px-4 text-brand font-semibold">{s.bestWpm}</td>
                    <td className="py-3 px-4 text-sky-400">{s.bestAccuracy}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
