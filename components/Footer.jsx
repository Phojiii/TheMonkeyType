"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/guide", label: "Guide" },
  { href: "/release-notes", label: "Release Notes" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/security-policy", label: "Security Policy" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      <div aria-hidden="true" className="h-0" />
      <footer className="fixed right-3 top-2 z-40 w-[calc(100%-1.5rem)] max-w-[16rem] rounded-3xl border border-white/10 bg-[#232325e6] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.34)] backdrop-blur-md md:right-6 md:top-6 md:w-[20rem] lg:w-[22rem]">
        <div className="mb-3 flex items-center justify-between border-b border-white/8 pb-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-brand/80">Quick Links</p>
          <span className="text-[11px] text-white/35">TheMonkeyType</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-1">
          {footerLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
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

        <div className="mt-3 border-t border-white/8 pt-2 text-[11px] text-white/35">
          Copyright TheMonkeyType
        </div>
      </footer>
    </>
  );
}
