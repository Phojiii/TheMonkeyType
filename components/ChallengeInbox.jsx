"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ChallengeInbox() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const authReady = isLoaded && isSignedIn;
  const [pending, setPending] = useState(null);
  const [active, setActive] = useState(null);
  const [busyAction, setBusyAction] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!authReady) {
      setPending(null);
      setActive(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/challenge/inbox", { cache: "no-store" });
        if (res.status === 401) {
          if (!cancelled) {
            setPending(null);
            setActive(null);
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setPending(data?.pending || null);
          setActive(data?.active || null);
        }
      } catch (error) {
        if (!cancelled) {
          setPending(null);
          setActive(null);
        }
      }
    };

    load();
    const timer = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [isLoaded, authReady]);

  const activePath = active ? `/challenge/${active.id}` : "";
  const pendingExpiresIn = useMemo(() => {
    if (!pending?.expiresAt) return "";
    const ms = new Date(pending.expiresAt).getTime() - Date.now();
    if (ms <= 0) return "Expired";
    return `${Math.max(1, Math.ceil(ms / 1000))}s left`;
  }, [pending]);

  async function respond(action) {
    if (!pending?.id) return;
    setBusyAction(action);
    try {
      const res = await fetch("/api/challenge/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: pending.id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to respond");

      if (action === "accept") {
        setPending(null);
        router.push(`/challenge/${pending.id}`);
      } else {
        setPending(null);
      }
    } catch (error) {
      alert(error.message || "Failed to respond");
    } finally {
      setBusyAction("");
    }
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <>
      {pending && pathname !== `/challenge/${pending.id}` && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1b1c1f] p-6 text-white shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-brand/80">Challenge request</p>
            <h2 className="mt-2 text-2xl font-bold">{pending.opponent.username} challenged you</h2>
            <p className="mt-3 text-sm text-white/70">
              {pending.duration}s competitive duel. {pendingExpiresIn}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => respond("accept")}
                disabled={busyAction !== ""}
                className="flex-1 rounded-lg bg-brand px-4 py-2 font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
              >
                {busyAction === "accept" ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => respond("reject")}
                disabled={busyAction !== ""}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                {busyAction === "reject" ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {active && pathname !== activePath && (
        <div className="fixed bottom-4 right-4 z-[80] w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-white/10 bg-[#1b1c1f]/95 p-4 text-white shadow-2xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-brand/80">Live challenge</p>
          <h3 className="mt-1 text-lg font-semibold">{active.opponent.username} is waiting</h3>
          <p className="mt-1 text-sm text-white/70">Join your {active.duration}s duel and submit your run.</p>
          <button
            onClick={() => router.push(activePath)}
            className="mt-4 w-full rounded-lg bg-brand px-4 py-2 font-semibold text-black transition hover:brightness-110"
          >
            Open challenge
          </button>
        </div>
      )}
    </>
  );
}
