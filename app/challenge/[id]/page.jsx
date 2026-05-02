"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import TypingTest from "@/components/TypingTest";

const CHALLENGE_HISTORY_KEY_PREFIX = "tmt_challenge_history";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function persistChallengeResult(userId, challenge) {
  if (!userId || !challenge?.id || challenge.status !== "done") return;

  const storageKey = `${CHALLENGE_HISTORY_KEY_PREFIX}_${userId}`;
  const outcome = !challenge.winnerId
    ? "draw"
    : challenge.winnerId === challenge.me.userId
    ? "win"
    : "loss";

  const entry = {
    challengeId: challenge.id,
    userId,
    opponentId: challenge.opponent.userId,
    opponentUsername: challenge.opponent.username || "Anonymous",
    duration: Number(challenge.duration || 60),
    outcome,
    myWpm: Number(challenge.me?.result?.wpm || 0),
    myAccuracy: Number(challenge.me?.result?.accuracy || 0),
    opponentWpm: Number(challenge.opponent?.result?.wpm || 0),
    opponentAccuracy: Number(challenge.opponent?.result?.accuracy || 0),
    date: new Date(challenge.completedAt || challenge.updatedAt || Date.now()).toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const safeArr = Array.isArray(existing) ? existing : [];
    if (safeArr.some((item) => item?.challengeId === entry.challengeId)) return;
    safeArr.push(entry);
    localStorage.setItem(storageKey, JSON.stringify(safeArr));
  } catch {}
}

export default function ChallengePage({ params }) {
  const resolvedParams = use(params);
  const challengeId = resolvedParams?.id || "";
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const authReady = isLoaded && isSignedIn;
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");
  const historySavedRef = useRef("");
  const challengeRef = useRef(null);

  useEffect(() => {
    challengeRef.current = challenge;
  }, [challenge]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!authReady || !challengeId) {
      if (!challengeRef.current) setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/challenge/${challengeId}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (res.status === 401) {
          // Keep the current challenge onscreen if Clerk briefly refreshes auth mid-run.
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          const nextError = data?.error || "Failed to load challenge";

          if (!cancelled && !challengeRef.current) {
            setError(nextError);
          }

          return;
        }

        if (!cancelled) {
          setChallenge(data.challenge);
          setError("");
        }
      } catch (err) {
        if (!cancelled && !challengeRef.current) {
          setError(err.message || "Failed to load challenge");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const timer = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isLoaded, authReady, challengeId]);

  useEffect(() => {
    if (!user?.id || !challenge?.id || challenge.status !== "done") return;
    if (historySavedRef.current === challenge.id) return;

    persistChallengeResult(user.id, challenge);
    historySavedRef.current = challenge.id;
  }, [challenge, user?.id]);

  const winnerLabel = useMemo(() => {
    if (!challenge?.winnerId) return "Draw";
    return challenge.winnerId === challenge.me.userId ? "You won" : `${challenge.opponent.username} won`;
  }, [challenge]);

  async function fetchWithAuthRetry(input, init = {}, retries = 1) {
    const response = await fetch(input, {
      credentials: "include",
      ...init,
    });

    if (response.status === 401 && retries > 0) {
      await delay(500);
      return fetchWithAuthRetry(input, init, retries - 1);
    }

    return response;
  }

  async function respond(action) {
    if (!challenge?.id) return;
    setResponding(true);
    try {
      const res = await fetchWithAuthRetry("/api/challenge/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to respond");
      setChallenge((current) =>
        current ? { ...current, status: action === "accept" ? "active" : "rejected" } : current
      );
      if (action === "accept") router.refresh();
    } catch (err) {
      alert(err.message || "Failed to respond");
    } finally {
      setResponding(false);
    }
  }

  async function submitResult(stats) {
    if (!challenge?.id || submitting) return;
    setSubmitting(true);

    const normalizedStats = {
      wpm: Math.max(0, Math.round(Number(stats?.wpm) || 0)),
      accuracy: Math.max(0, Math.round(Number(stats?.accuracy) || 0)),
      words: Math.max(0, Math.round(Number(stats?.words) || 0)),
      hits: Math.max(0, Math.round(Number(stats?.hits) || 0)),
    };

    setChallenge((current) => {
      if (!current) return current;

      const mine = {
        ...normalizedStats,
        finishedAt: new Date().toISOString(),
      };

      return current.role === "creator"
        ? { ...current, me: { ...current.me, result: mine } }
        : { ...current, me: { ...current.me, result: mine } };
    });

    try {
      const res = await fetchWithAuthRetry(`/api/challenge/${challenge.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedStats),
      });

      if (res.status === 401) {
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit result");

      const refresh = await fetchWithAuthRetry(`/api/challenge/${challenge.id}`, {
        cache: "no-store",
      });

      if (refresh.status === 401) {
        return;
      }

      const fresh = await refresh.json();
      if (!refresh.ok) throw new Error(fresh?.error || "Failed to refresh challenge");
      setChallenge(fresh.challenge);
    } catch (err) {
      alert(err.message || "Failed to submit result");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoaded) {
    return <main className="min-h-screen bg-ink px-6 py-10 text-white">Loading user...</main>;
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-ink px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <p>Please sign in to join a challenge.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="min-h-screen bg-ink px-6 py-10 text-white">Loading challenge...</main>;
  }

  if (error || !challenge) {
    return (
      <main className="min-h-screen bg-ink px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
          {error || "Challenge not found"}
        </div>
      </main>
    );
  }

  const myResult = challenge.me?.result;
  const opponentResult = challenge.opponent?.result;

  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand/80">1v1 challenge</p>
            <h1 className="mt-2 text-3xl font-bold">{challenge.me.username} vs {challenge.opponent.username}</h1>
            <p className="mt-2 text-sm text-white/60">{challenge.duration}s competitive duel</p>
          </div>
          <Link href="/leaderboard" className="btn-ghost text-sm">
            Back to ranking
          </Link>
        </div>

        {challenge.status === "pending" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            {challenge.role === "opponent" ? (
              <>
                <h2 className="text-xl font-semibold">Incoming challenge from {challenge.opponent.username}</h2>
                <p className="mt-2 text-white/70">Accept to start the duel, or reject if you are not ready.</p>
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => respond("accept")}
                    disabled={responding}
                    className="btn-primary"
                  >
                    {responding ? "Working..." : "Accept"}
                  </button>
                  <button
                    onClick={() => respond("reject")}
                    disabled={responding}
                    className="btn-secondary"
                  >
                    Reject
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Challenge sent</h2>
                <p className="mt-2 text-white/70">Waiting for {challenge.opponent.username} to accept. This request expires automatically if they do not respond.</p>
              </>
            )}
          </section>
        )}

        {challenge.status === "active" && !myResult && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
            <p className="mb-4 text-sm text-white/60">Shared text. Backspace penalty is active for both players.</p>
            <TypingTest
              key={challenge.id}
              initialText={challenge.text}
              durationSec={challenge.duration}
              competitiveMode
              showResultModal={false}
              onComplete={submitResult}
            />
          </section>
        )}

        {challenge.status === "active" && myResult && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Result submitted</h2>
            <p className="mt-2 text-white/70">
              Waiting for {challenge.opponent.username} to finish. Your run: {myResult.wpm} WPM at {myResult.accuracy}% accuracy.
            </p>
          </section>
        )}

        {challenge.status === "done" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold text-brand">{winnerLabel}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">You</p>
                <p className="mt-2 text-2xl font-bold">{myResult?.wpm || 0} WPM</p>
                <p className="text-white/70">Accuracy {myResult?.accuracy || 0}%</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-white/60">{challenge.opponent.username}</p>
                <p className="mt-2 text-2xl font-bold">{opponentResult?.wpm || 0} WPM</p>
                <p className="text-white/70">Accuracy {opponentResult?.accuracy || 0}%</p>
              </div>
            </div>
          </section>
        )}

        {challenge.status === "rejected" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Challenge declined</h2>
            <p className="mt-2 text-white/70">This duel was rejected and will not start.</p>
          </section>
        )}

        {challenge.status === "expired" && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Challenge expired</h2>
            <p className="mt-2 text-white/70">The challenge timed out before both players finished.</p>
          </section>
        )}
      </div>
    </main>
  );
}
