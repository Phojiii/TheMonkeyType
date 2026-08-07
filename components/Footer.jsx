"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/guide", label: "Guide" },
  { href: "/release-notes", label: "Release Notes" },
  { href: "/contact", label: "Contact" },
  { href: "https://discord.gg/5G2WvTYbPR", label: "Discord", external: true },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/security-policy", label: "Security Policy" },
];

export default function Footer({ embedded = false } = {}) {
  const pathname = usePathname();
  const [onlineCount, setOnlineCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const lobbyLabel = onlineCount === 1 ? "1 player online" : `${onlineCount} players online`;

  useEffect(() => {
    const handleCount = (event) => {
      const count = Number(event?.detail?.count || 0);
      setOnlineCount(Number.isFinite(count) ? count : 0);
    };

    const media = window.matchMedia("(min-width: 768px)");
    const syncExpanded = () => {
      const nextIsDesktop = media.matches;
      setIsDesktop(nextIsDesktop);
      setExpanded(nextIsDesktop);
    };

    syncExpanded();
    window.addEventListener("tmt:lobby-count", handleCount);
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncExpanded);
    } else {
      media.addListener(syncExpanded);
    }

    return () => {
      window.removeEventListener("tmt:lobby-count", handleCount);
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", syncExpanded);
      } else {
        media.removeListener(syncExpanded);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDesktop || !expanded) return;

    const timer = window.setTimeout(() => {
      setExpanded(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [expanded, isDesktop]);

  const openLobby = () => {
    window.dispatchEvent(new CustomEvent("tmt:lobby-toggle", { detail: { open: true } }));
  };

  const linksPanel = (
    <>
      <div className="grid grid-cols-1 gap-2 pt-3 text-xs">
        {footerLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={!link.external && isActive ? "page" : undefined}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className={[
                "rounded-2xl px-3 py-2 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                isActive
                  ? "bg-brand text-black shadow-[0_0_14px_rgba(226,183,20,0.28)]"
                  : "bg-white/[0.03] text-white/65 hover:bg-white/10 hover:text-brand active:scale-[0.98] active:bg-white/15",
              ].join(" ")}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {!embedded && (
        <button
          type="button"
          onClick={openLobby}
          className="btn-primary mt-3 flex w-full items-center justify-between shadow-[0_14px_30px_rgba(226,183,20,0.22)] md:hidden"
          aria-controls="online-users-lobby"
        >
          <span>Live lobby</span>
          <span className="rounded-full bg-black/12 px-2 py-0.5 text-xs text-black/75">{lobbyLabel}</span>
        </button>
      )}

      <div className="mt-3 border-t border-white/8 pt-2 text-[11px] text-white/35">
        Copyright TheMonkeyType
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="relative inline-flex shrink-0">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="inline-flex min-w-[12rem] items-center justify-between gap-3 rounded-full border border-white/10 bg-[#232325e6] px-4 py-2 text-left shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-md transition hover:border-brand/30"
          aria-expanded={expanded}
          aria-controls="footer-links-panel"
        >
          <span className="text-[11px] uppercase tracking-[0.24em] text-brand/80">Quick Links</span>
          <span className="text-sm text-white/60">{expanded ? "-" : "+"}</span>
        </button>

        {expanded && (
          <div
            id="footer-links-panel"
            className="absolute right-0 top-full z-50 mt-2 w-[18rem] overflow-hidden rounded-3xl border border-white/10 bg-[#232325f5] shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-md"
          >
            <div className="px-3 pb-3">{linksPanel}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div aria-hidden="true" className="h-0" />
      <footer className="fixed bottom-[10%] right-[5%] z-40 w-[calc(100%-1.5rem)] max-w-[16rem] overflow-hidden rounded-3xl border border-white/10 bg-[#232325e6] shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-md md:bottom-auto md:right-56 md:top-6 md:w-[20rem] lg:w-[22rem]">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex w-full items-center justify-between px-3 py-3 text-left"
          aria-expanded={expanded}
          aria-controls="footer-links-panel"
        >
          <div className="flex min-w-0 items-center gap-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-brand/80">Quick Links</p>
          </div>
          <span className="text-sm text-white/60">{expanded ? "-" : "+"}</span>
        </button>

        {expanded && (
          <div id="footer-links-panel" className="border-t border-white/8 px-3 pb-3">
            {linksPanel}
          </div>
        )}
      </footer>
    </>
  );
}
