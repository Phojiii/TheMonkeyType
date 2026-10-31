"use client";

import { useEffect, useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";

export default function FollowButton({ targetUserId, compact = false }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { openSignIn } = useClerk();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !targetUserId || targetUserId === user?.id) {
      setFollowing(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        if (!(await getToken())) return;
        const response = await fetch(`/api/friends?target=${encodeURIComponent(targetUserId)}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) setFollowing(Boolean(data.isFollowing));
      } catch {}
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, targetUserId, user?.id]);

  if (!isLoaded || !targetUserId || (isSignedIn && targetUserId === user?.id)) return null;

  async function toggleFollow() {
    if (!isSignedIn) {
      openSignIn?.();
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (!(await getToken())) throw new Error("Please sign in again to follow this typist.");
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: targetUserId, action: following ? "unfollow" : "follow" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Could not update follow.");
      setFollowing(Boolean(data.isFollowing));
    } catch (requestError) {
      setError(requestError.message || "Could not update follow.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={busy}
        aria-pressed={following}
        className={`${following ? "btn-secondary" : "btn-primary"} ${compact ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"} disabled:cursor-wait disabled:opacity-60`}
      >
        {busy ? "Saving..." : following ? "Unfollow" : "Follow"}
      </button>
      {error ? <span role="status" className="mt-1 max-w-40 text-xs text-red-300">{error}</span> : null}
    </span>
  );
}
