"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

const CHALLENGE_DURATIONS = [15, 30, 60, 120];

export default function FriendsHub() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [friends, setFriends] = useState([]);
  const [results, setResults] = useState([]);
  const [myWeek, setMyWeek] = useState({ tests: 0, averageWpm: 0, bestWpm: 0, words: 0 });
  const [query, setQuery] = useState("");
  const [duration, setDuration] = useState(60);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const initialLoadUserRef = useRef("");

  const loadFriends = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim().length >= 2) params.set("q", search.trim());
      let response;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const sessionToken = await getToken();
        if (!sessionToken) return;
        response = await fetch(`/api/friends?${params}`, { cache: "no-store", credentials: "include" });
        if (response.status !== 401 || attempt === 1) break;
        await new Promise((resolve) => window.setTimeout(resolve, 400));
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not load friends.");
      setFriends(Array.isArray(data.friends) ? data.friends : []);
      setResults(Array.isArray(data.results) ? data.results : []);
      setMyWeek(data.me || { tests: 0, averageWpm: 0, bestWpm: 0, words: 0 });
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Could not load friends.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn) {
      initialLoadUserRef.current = "";
      return;
    }
    if (isLoaded && user?.id && initialLoadUserRef.current !== user.id) {
      initialLoadUserRef.current = user.id;
      loadFriends();
    }
  }, [isLoaded, isSignedIn, user?.id, loadFriends]);

  async function toggleFollow(target, currentlyFollowing) {
    setBusy(target.userId);
    setMessage("");
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: target.userId, action: currentlyFollowing ? "unfollow" : "follow" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not update follow.");
      await loadFriends(query);
    } catch (error) {
      setMessage(error.message || "Could not update follow.");
    } finally {
      setBusy("");
    }
  }

  async function challengeFriend(friend) {
    setBusy(friend.userId);
    setMessage("");
    try {
      const response = await fetch("/api/challenge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ opponentUserId: friend.userId, duration }),
      });
      const data = await response.json();
      if (!response.ok && data?.challengeId) {
        router.push(`/challenge/${data.challengeId}`);
        return;
      }
      if (!response.ok) throw new Error(data?.error || "Could not send challenge.");
      router.push(`/challenge/${data.challengeId}`);
    } catch (error) {
      setMessage(error.message || "Could not send challenge.");
    } finally {
      setBusy("");
    }
  }

  if (!isLoaded) return null;

  return (
    <section className="rounded-[2rem] border border-white/8 bg-[#2a2b2f] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand/80">Practice together</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Friends and weekly progress</h2>
          <p className="mt-2 text-sm text-white/55">Follow typists, compare this week’s activity, and challenge online friends.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white/65">
          Your week: <span className="text-brand">{myWeek.tests} tests</span> · <span className="text-brand">{myWeek.averageWpm} avg WPM</span>
        </div>
      </div>

      {!isSignedIn ? (
        <p className="mt-6 rounded-2xl bg-black/15 p-4 text-sm text-white/60">Sign in to follow typists and compare weekly progress.</p>
      ) : (
        <>
          <form onSubmit={(event) => { event.preventDefault(); loadFriends(query); }} className="mt-6 flex flex-wrap gap-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a typist by name" className="min-w-[14rem] flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-brand/50" />
            <button type="submit" className="btn-secondary">Search</button>
            {query ? <button type="button" onClick={() => { setQuery(""); loadFriends(""); }} className="btn-ghost">Clear</button> : null}
          </form>

          {message ? <p role="status" className="mt-4 text-sm text-red-300">{message}</p> : null}

          {results.length ? (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-[0.18em] text-white/40">Search results</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {results.map((person) => (
                  <PersonCard key={person.userId} person={person} busy={busy === person.userId} onFollow={() => toggleFollow(person, person.followed)} />
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs uppercase tracking-[0.18em] text-white/40">Following · weekly snapshot</h3>
            <label className="flex items-center gap-2 text-xs text-white/50">Challenge length
              <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="rounded-xl border border-white/10 bg-[#202124] px-3 py-2 text-white">
                {CHALLENGE_DURATIONS.map((value) => <option key={value} value={value}>{value}s</option>)}
              </select>
            </label>
          </div>
          {loading ? <p className="mt-4 text-sm text-white/50">Loading your list...</p> : friends.length ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {friends.map((friend) => {
                const delta = friend.weekly.averageWpm - myWeek.averageWpm;
                return (
                  <article key={friend.userId} className="rounded-2xl border border-white/8 bg-black/12 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar person={friend} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/profile/${friend.slug}`} className="truncate font-semibold text-white hover:text-brand">{friend.username}</Link>
                        <p className="mt-1 text-xs text-white/45">{friend.online ? <span className="text-emerald-300">Online</span> : "Offline"} · {friend.weekly.tests} tests this week</p>
                      </div>
                      <span className="text-xs text-white/50">{delta > 0 ? `+${delta}` : delta} WPM</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <Metric label="Avg WPM" value={friend.weekly.averageWpm} />
                      <Metric label="Best WPM" value={friend.weekly.bestWpm} />
                      <Metric label="Words" value={friend.weekly.words} />
                    </div>
                    <button type="button" onClick={() => challengeFriend(friend)} disabled={!friend.online || busy === friend.userId} className="btn-primary mt-4 w-full text-xs disabled:cursor-not-allowed disabled:opacity-40">
                      {busy === friend.userId ? "Sending..." : friend.online ? `Challenge ${duration}s` : "Friend is offline"}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl bg-black/15 p-4 text-sm text-white/50">{query ? "No typists found. Search by another username or display name." : "You are not following anyone yet. Search for a typist above to get started."}</p>
          )}
        </>
      )}
    </section>
  );
}

function Avatar({ person }) {
  return person.imageUrl ? (
    <Image src={person.imageUrl} alt="" width={42} height={42} className="h-[42px] w-[42px] rounded-full object-cover" unoptimized />
  ) : (
    <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/10 text-sm text-white/65">{person.username?.slice(0, 1)?.toUpperCase() || "T"}</span>
  );
}

function PersonCard({ person, busy, onFollow }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/12 p-3">
      <Avatar person={person} />
      <div className="min-w-0 flex-1">
        <Link href={`/profile/${person.slug}`} className="truncate font-medium text-white hover:text-brand">{person.username}</Link>
        <p className="text-xs text-white/45">{person.weekly.tests} tests this week · {person.weekly.averageWpm} avg WPM</p>
      </div>
      <button type="button" onClick={onFollow} disabled={busy} className={person.followed ? "btn-secondary px-3 py-1.5 text-xs" : "btn-primary px-3 py-1.5 text-xs"}>
        {busy ? "..." : person.followed ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-xl bg-white/[0.04] px-2 py-2"><div className="text-white/35">{label}</div><div className="mt-1 text-sm text-white">{value}</div></div>;
}
