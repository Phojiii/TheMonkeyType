'use client';

export default function AnnouncementModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#232325] w-[90%] max-w-md rounded-2xl shadow-xl p-6 text-white relative
                      animate-in fade-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-yellow-400"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-yellow-400 mb-3">
          📢 New Announcement
        </h2>

        <p className="text-sm text-white/80 leading-relaxed">
          👉 Welcome to The Monkey Type (TMT)
          <br /><br />
          <span className="inline-block animate-pulse">🏆</span>{" "}
          Competitive Mode is now live - RACE, RANK, and dominate the Leaderboard.
          <br /><br />
          Switch modes, test your skills, and see where you rank 🚀
          <br /><br />
          ⚔️ <strong>Coming next</strong>: challenge other players to a 1v1 typing duel.
        </p>



        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
