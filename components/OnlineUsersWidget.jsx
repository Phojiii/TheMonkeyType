"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

const DURATION_OPTIONS = [15, 30, 60, 120];

export default function OnlineUsersWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const { openSignIn } = useClerk();
  const { isLoaded, isSignedIn } = useUser();

  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(60);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [challenging, setChallenging] = useState("");

  const authReady = isLoaded && isSignedIn;
  const onlineCount = users.length;
  const isChallengePage = pathname?.startsWith("/challenge/");

  useEffect(() => {
    let cancelled = false;

    const pingPresence = async () => {
      if (!authReady) return;
      try {
        await fetch("/api/presence", { method: "POST" });
      } catch {}
    };

    const loadUsers = async () => {
      if (!cancelled) setLoading(true);
      try {
        const res = await fetch("/api/online-users?limit=18", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!cancelled) {
          setUsers(Array.isArray(data?.users) ? data.users : []);
        }
      } catch {
        if (!cancelled) setUsers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();
    pingPresence();

    const usersTimer = setInterval(loadUsers, 8000);
    const presenceTimer = authReady ? setInterval(pingPresence, 25000) : null;

    return () => {
      cancelled = true;
      clearInterval(usersTimer);
      if (presenceTimer) clearInterval(presenceTimer);
    };
  }, [authReady]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const lobbyLabel = useMemo(() => {
    if (loading && users.length === 0) return "Loading lobby";
    return onlineCount === 1 ? "1 player online" : `${onlineCount} players online`;
  }, [loading, onlineCount, users.length]);

  async function handleChallenge(userId) {
    if (!userId || challenging) return;

    if (!isSignedIn) {
      openSignIn?.();
      return;
    }

    setChallenging(userId);
    try {
      const res = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ opponentUserId: userId, duration }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.challengeId) {
          setOpen(false);
          router.push(`/challenge/${data.challengeId}`);
          return;
        }
        throw new Error(data?.error || "Failed to create challenge");
      }

      setOpen(false);
      router.push(`/challenge/${data.challengeId}`);
    } catch (error) {
      alert(error.message || "Failed to create challenge");
    } finally {
      setChallenging("");
    }
  }

  return (
    <div className={`fixed right-4 z-[85] ${isChallengePage ? "bottom-28" : "bottom-28 md:bottom-24"}`}>
      {open && (
        <div
          id="online-users-lobby"
          className="mb-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#232427]/95 shadow-2xl backdrop-blur-md"
        >
          <div className="border-b border-white/10 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-brand/80">Live lobby</p>
                <h2 className="mt-1 text-lg font-semibold text-white">Challenge online players</h2>
                <p className="mt-1 text-sm text-white/60">
                  Pick a duration, then send a 1v1 typing duel. Signing in is only needed when you challenge.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost px-3 py-1.5 text-xs">
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDuration(option)}
                  className={`text-xs ${duration === option ? "btn-tab-active" : "btn-tab"}`}
                >
                  {option}s
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[24rem] overflow-y-auto px-3 py-3">
            {loading && users.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-white/55">Loading online players...</div>
            ) : users.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-white/55">
                No other players are online right now.
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((entry) => (
                  <div
                    key={entry.userId}
                    className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3 transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-3">
                      {entry.imageUrl ? (
                        <Image
                          src={entry.imageUrl}
                          alt={entry.username}
                          width={40}
                          height={40}
                          className="rounded-full"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }}
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm text-white/65">
                          {entry.username?.slice(0, 1)?.toUpperCase() || "A"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                          <p className="truncate font-medium text-white">{entry.username}</p>
                        </div>
                        <p className="mt-1 text-xs text-white/55">
                          Best {entry.bestWpm} WPM
                          {entry.category ? ` | ${entry.category}s` : ""}
                          {entry.country ? ` | ${entry.country}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-white/45">Competitive duel | {duration}s</span>
                      <button
                        type="button"
                        onClick={() => handleChallenge(entry.userId)}
                        disabled={challenging === entry.userId}
                        className="btn-primary px-3 py-1.5 text-xs"
                      >
                        {challenging === entry.userId ? "Sending..." : isSignedIn ? "Challenge" : "Sign in"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-primary min-w-[12rem] justify-between shadow-[0_14px_30px_rgba(226,183,20,0.22)]"
        aria-expanded={open}
        aria-controls="online-users-lobby"
      >
        <span>Live lobby</span>
        <span className="rounded-full bg-black/12 px-2 py-0.5 text-xs text-black/75">{lobbyLabel}</span>
      </button>
    </div>
  );
}
