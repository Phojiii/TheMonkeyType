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
            The Monkey Type has a refreshed UI with a cleaner typing experience, stronger button styling, and a much
            better mobile layout. The goal was to make the site feel lighter, clearer, and easier to use every day.
          </p>

          <p>
            We&apos;ve also rolled out live features. You can now see online players, open the live lobby, send 1v1
            challenges, and accept or reject duels directly from the site.
          </p>

          <p>
            There&apos;s also a new Guide page to help you understand how tests, rankings, stats, and challenges work.
            If you&apos;re new here, it&apos;s the best place to get familiar with everything quickly.
          </p>

          <p>
            Explore the update, try the new challenge flow, and let us know what you&apos;d like us to build next.
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
