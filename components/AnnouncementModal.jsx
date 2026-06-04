'use client';

import { SITE_ANNOUNCEMENT } from "@/lib/siteAnnouncement";

export default function AnnouncementModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-md animate-in rounded-2xl bg-[#232325] p-6 text-white shadow-xl fade-in zoom-in-95 duration-200">
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

        <div className="mt-5 text-right">
          <button onClick={onClose} className="btn-primary">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
