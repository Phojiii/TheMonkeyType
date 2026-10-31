'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SITE_ANNOUNCEMENT } from "@/lib/siteAnnouncement";

export default function AnnouncementModal({ onClose, followNotifications = [], isSignedIn = false }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!panelRef.current?.contains(event.target)) onClose?.();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div ref={panelRef} className="relative max-h-[90vh] w-[90%] max-w-md animate-in overflow-y-auto rounded-2xl bg-[#232325] p-6 text-white shadow-xl fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-white/60 transition hover:text-yellow-400"
          aria-label="Close announcement"
        >
          x
        </button>

        <h2 className="mb-3 text-xl font-bold text-yellow-400">{SITE_ANNOUNCEMENT.modalTitle}</h2>

        <div className="space-y-4 text-sm leading-relaxed text-white/80">
          {SITE_ANNOUNCEMENT.modalParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-6 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Followers</h3>
            {followNotifications.some((notification) => !notification.readAt) ? (
              <span className="rounded-full bg-brand/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-brand">New</span>
            ) : null}
          </div>
          {!isSignedIn ? (
            <p className="mt-3 text-xs leading-5 text-white/50">Sign in to see who follows you.</p>
          ) : followNotifications.length ? (
            <div className="mt-3 space-y-2">
              {followNotifications.map((notification) => {
                const actor = notification.actor || {};
                const rowClass = `flex items-center gap-3 rounded-xl border px-3 py-2.5 transition ${notification.readAt ? "border-white/8" : "border-brand/25 bg-brand/[0.06]"}`;
                const content = (
                  <>
                    {actor.imageUrl ? (
                      <Image src={actor.imageUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" unoptimized />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm text-brand">{actor.username?.slice(0, 1)?.toUpperCase() || "T"}</span>
                    )}
                    <span className="min-w-0 flex-1 text-xs leading-5 text-white/75">
                      <strong className="text-white">{actor.username || "A typist"}</strong> started following you.
                      <span className="block text-[10px] text-white/35">{formatNotificationDate(notification.createdAt)}</span>
                    </span>
                    {!notification.readAt ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" /> : null}
                  </>
                );
                return actor.slug ? (
                  <Link key={notification.id} href={`/profile/${actor.slug}`} onClick={onClose} className={`${rowClass} hover:border-brand/30 hover:bg-white/[0.04]`}>
                    {content}
                  </Link>
                ) : (
                  <div key={notification.id} className={rowClass}>{content}</div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-white/50">No one has followed you yet. Follow typists from their profile or the live lobby.</p>
          )}
        </section>

        <div className="mt-5 text-right">
          <Link href="/release-notes" passHref className="mr-2 btn-primary" onClick={onClose}>Release Note
          </Link>
          <button onClick={onClose} className="btn-primary">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

function formatNotificationDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}
