'use client';

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

        <h2 className="mb-3 text-xl font-bold text-yellow-400">What&apos;s New</h2>

        <div className="space-y-4 text-sm leading-relaxed text-white/80">
          <p>
            The Monkey Type has a fresh new look. We&apos;ve cleaned up the layout, improved the mobile experience,
            and made the main typing flow feel calmer, clearer, and easier to use.
          </p>

          <p>
            We&apos;ve also added live challenge features. You can now see online players, send 1v1 typing duels,
            accept or reject requests, and race head-to-head in competitive mode.
          </p>

          <p>
            Explore the updated UI, try the live lobby, and let us know what you&apos;d like to see next.
          </p>
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
