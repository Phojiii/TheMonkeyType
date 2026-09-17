"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaDonate, FaHeart } from "react-icons/fa";
import Footer from "@/components/Footer";

export default function SiteHeader() {
  const pathname = usePathname();
  const [donationOpen, setDonationOpen] = useState(false);

  // The home page owns this same header so beginner focus mode can hide it.
  if (pathname === "/") return null;

  return (
    <>
      <header className="mx-auto hidden w-full max-w-6xl items-center justify-between px-6 pb-4 pt-8 md:flex">
        <Link href="/" className="flex items-center gap-3" aria-label="TheMonkeyType home">
          <Image
            src="/TMT_Logo_2_new.png"
            alt="TheMonkeyType"
            width={150}
            height={40}
            priority
            style={{ width: "auto", height: "auto" }}
          />
        </Link>

        <nav className="flex items-center gap-3 text-sm text-white/70" aria-label="Site actions">
          <button onClick={() => setDonationOpen(true)} className="btn-secondary px-4 py-2 text-sm">
            Donate <FaDonate className="ml-1 inline-block" />
          </button>
          <Footer embedded />
        </nav>
      </header>

      {donationOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#1f2023]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand/80">Support</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Support TheMonkeyType</h2>
              </div>
              <button onClick={() => setDonationOpen(false)} className="btn-ghost px-3 py-1.5 text-xs">
                Close
              </button>
            </div>
            <p className="mb-5 text-sm leading-7 text-white/65">
              Thank you for supporting the project. Your contribution helps keep TheMonkeyType improving and available for everyone.
              <FaHeart className="ml-1 inline-block text-red-400" />
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="donate-glow">
                <Link href="https://ko-fi.com/themonkeytype" target="_blank" rel="noreferrer" className="btn-primary min-w-[11rem]">
                  Donate <FaDonate className="ml-1 inline-block" />
                </Link>
              </span>
              <button onClick={() => setDonationOpen(false)} className="btn-secondary">Maybe later</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
