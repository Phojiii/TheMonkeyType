"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/security-policy", label: "Security Policy" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      <div aria-hidden="true" className="h-44 md:h-20" />
      <footer className="fixed bottom-0 right-0 z-40 w-full border-t border-white/10 bg-[#232325cc] backdrop-blur-md">
        <div className="mx-auto hidden max-w-6xl flex-wrap items-center justify-center gap-3 px-6 py-4 text-xs text-white/50 md:flex">
          {footerLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-full px-3 py-1.5 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                  isActive
                    ? "bg-brand text-black shadow-[0_0_14px_rgba(226,183,20,0.28)]"
                    : "text-white/60 hover:bg-white/10 hover:text-brand active:scale-95 active:bg-white/15",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="px-2 py-1">Copyright TheMonkeyType</span>
          <span className="px-2 py-1">#323437 / #E2B714 | Roboto Mono</span>
        </div>
        <div className="mx-auto grid max-w-md grid-cols-2 gap-x-4 gap-y-2 px-6 py-4 text-xs text-white/30 md:hidden">
          <Link href="/contact" className="hover:text-white/60">contact</Link>
          <span className="text-right">serika dark</span>
          <Link href="https://github.com" className="hover:text-white/60">github</Link>
          <span className="text-right">v26.15.0</span>
          <Link href="https://discord.gg/5G2WvTYbPR" className="hover:text-white/60">discord</Link>
          <Link href="/terms" className="text-right hover:text-white/60">terms</Link>
          <Link href="/security-policy" className="hover:text-white/60">security</Link>
          <Link href="/privacy" className="text-right hover:text-white/60">privacy</Link>
        </div>
      </footer>
    </>
  );
}
