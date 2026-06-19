"use client";

import Image from "next/image";
import Link from "next/link";
import { FaDiscord, FaGithub, FaGlobe, FaInstagram, FaTiktok, FaTwitch, FaYoutube } from "react-icons/fa";

function formatValue(value, fallback = "-") {
  return value || fallback;
}

function formatDuration(totalSeconds) {
  const secs = Math.max(0, Math.floor(Number(totalSeconds || 0)));
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

function SocialLink({ href, icon, label }) {
  if (!href) return null;
  const safeHref = href.startsWith("http://") || href.startsWith("https://") ? href : `https://${href}`;

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/65 transition hover:border-brand/40 hover:bg-white/8 hover:text-brand"
      aria-label={label}
      title={label}
    >
      {icon}
    </a>
  );
}

function BestTile({ label, value, sub }) {
  return (
    <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.04] p-4">
      <div className="text-sm text-white/35">{label}</div>
      <div className="mt-2 text-4xl leading-none text-white">{value}</div>
      <div className="mt-2 text-sm text-white/45">{sub}</div>
    </div>
  );
}

function RankTile({ title, rank, total }) {
  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5">
      <div className="text-sm uppercase tracking-[0.14em] text-white/25">{title}</div>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="text-5xl leading-none text-white">{rank ? `${rank}${rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}` : "-"}</div>
        <div className="text-right text-xs uppercase tracking-[0.12em] text-white/30">
          <div>Rank</div>
          <div>{total ? `${total} total` : "Unranked"}</div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileView({ bundle, isOwner = false, ownerActions = null }) {
  const profile = bundle?.profile;
  const placements = Array.isArray(bundle?.placements) ? bundle.placements : [];
  const timeBests = profile?.timeBests || {};
  const wordBests = profile?.wordBests || {};
  const levelInfo = profile?.levelInfo || { level: 1, progress: 0, needed: 1, xp: 0 };
  const progressPercent = Math.min(100, Math.round((Number(levelInfo.progress || 0) / Math.max(1, Number(levelInfo.needed || 1))) * 100));

  if (!profile) {
    return (
      <div className="rounded-[1.5rem] border border-red-400/20 bg-red-500/10 p-6 text-white/80">
        Profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[#2a2b2f] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] md:p-7">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr_1.25fr_auto]">
          <div className="flex gap-4 border-white/8 xl:border-r xl:pr-6">
            {profile.imageUrl ? (
              <Image
                src={profile.imageUrl}
                alt={profile.displayName || profile.username || "Profile"}
                width={110}
                height={110}
                className="h-[110px] w-[110px] rounded-[1.6rem] object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-[110px] w-[110px] items-center justify-center rounded-[1.6rem] bg-white/8 text-4xl text-white/60">
                {(profile.displayName || profile.username || "A").slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-4xl leading-none text-white">{profile.displayName || profile.username}</h1>
                <span className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-ink">
                  {profile.title || "Rising"}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/30">
                Joined {new Date(profile.joinedAt || Date.now()).toLocaleDateString()}
              </p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm text-white/55">
                  <span>Level {levelInfo.level}</span>
                  <span>{levelInfo.xp} XP</span>
                </div>
                <div className="h-3 rounded-full bg-black/18">
                  <div
                    className="h-full rounded-full bg-brand shadow-[0_0_18px_rgba(226,183,20,0.25)]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-2 text-right text-sm text-white/28">
                  {levelInfo.progress}/{levelInfo.needed} to next level
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-white/8 xl:border-r xl:px-6">
            <div>
              <div className="text-sm text-white/35">tests started</div>
              <div className="mt-1 text-5xl leading-none text-white">{Number(profile.aggregate?.testsStarted || 0)}</div>
            </div>
            <div>
              <div className="text-sm text-white/35">tests completed</div>
              <div className="mt-1 text-5xl leading-none text-white">{Number(profile.aggregate?.testsCompleted || 0)}</div>
            </div>
            <div>
              <div className="text-sm text-white/35">time typing</div>
              <div className="mt-1 text-5xl leading-none text-white">{formatDuration(profile.aggregate?.totalTypingSeconds || 0)}</div>
            </div>
          </div>

          <div className="grid gap-4 border-white/8 xl:border-r xl:px-6">
            <div>
              <div className="text-sm text-white/35">bio</div>
              <div className="mt-2 whitespace-pre-wrap text-base leading-7 text-white/82">
                {profile.bio || "This typist has not added a bio yet."}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/35">keyboard layout</div>
              <div className="mt-2 text-xl text-white">{formatValue(profile.keyboardLayout, "QWERTY")}</div>
            </div>
            {profile.altLayoutAccount ? (
              <div>
                <div className="text-sm text-white/35">alt layout account</div>
                <div className="mt-2 break-all text-base text-white/80">{profile.altLayoutAccount}</div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-row gap-3 xl:flex-col xl:items-center">
            <SocialLink href={profile.socials?.youtube} icon={<FaYoutube />} label="YouTube" />
            <SocialLink href={profile.socials?.twitch} icon={<FaTwitch />} label="Twitch" />
            <SocialLink href={profile.socials?.tiktok} icon={<FaTiktok />} label="TikTok" />
            <SocialLink href={profile.socials?.instagram} icon={<FaInstagram />} label="Instagram" />
            <SocialLink href={profile.socials?.github} icon={<FaGithub />} label="GitHub" />
            <SocialLink href={profile.socials?.website} icon={<FaGlobe />} label="Website" />
            <SocialLink href={profile.socials?.discord} icon={<FaDiscord />} label="Discord" />
          </div>
        </div>

        {isOwner && ownerActions ? (
          <div className="mt-6 border-t border-white/8 pt-5">{ownerActions}</div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <RankTile
          title="15 seconds"
          rank={placements.find((item) => item.category === 15)?.rank}
          total={placements.find((item) => item.category === 15)?.total}
        />
        <RankTile
          title="60 seconds"
          rank={placements.find((item) => item.category === 60)?.rank}
          total={placements.find((item) => item.category === 60)?.total}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[1.8rem] border border-white/8 bg-[#2a2b2f] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.16em] text-white/25">Time mode</p>
              <h2 className="mt-2 text-3xl text-white">Personal Bests</h2>
            </div>
            <Link href="/leaderboard" className="btn-secondary text-sm">
              Leaderboard
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[15, 30, 60, 120].map((category) => (
              <BestTile
                key={`time-${category}`}
                label={`${category} seconds`}
                value={Number(timeBests?.[String(category)]?.wpm || 0)}
                sub={`${Number(timeBests?.[String(category)]?.accuracy || 0)}% accuracy`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/8 bg-[#2a2b2f] p-5">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.16em] text-white/25">Word mode</p>
            <h2 className="mt-2 text-3xl text-white">Personal Bests</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[10, 25, 50, 100].map((category) => (
              <BestTile
                key={`words-${category}`}
                label={`${category} words`}
                value={Number(wordBests?.[String(category)]?.wpm || 0)}
                sub={
                  Number(wordBests?.[String(category)]?.elapsedSec || 0) > 0
                    ? `${Number(wordBests?.[String(category)]?.elapsedSec || 0).toFixed(1)}s • ${Number(wordBests?.[String(category)]?.accuracy || 0)}%`
                    : `${Number(wordBests?.[String(category)]?.accuracy || 0)}% accuracy`
                }
              />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[1.8rem] border border-white/8 bg-[#2a2b2f] p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-white/25">Quick stats</p>
            <h2 className="mt-2 text-3xl text-white">Recent profile summary</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <BestTile label="Total characters" value={Number(profile.aggregate?.totalCharacters || 0)} sub="Counted from signed-in runs" />
          <BestTile label="Backspaces" value={Number(profile.aggregate?.totalBackspaces || 0)} sub="Normal typing modes only" />
          <BestTile label="Public profile" value={profile.slug || "-"} sub="Use this in your profile URL" />
          <BestTile label="Username" value={profile.username || "-"} sub="Synced from your account" />
        </div>
      </section>
    </div>
  );
}
