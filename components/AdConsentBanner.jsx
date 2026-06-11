"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readStoredAdConsent, writeStoredAdConsent } from "@/lib/adConsent";

export default function AdConsentBanner() {
  const [consent, setConsent] = useState("unknown");

  useEffect(() => {
    setConsent(readStoredAdConsent());
  }, []);

  if (consent !== "unknown") return null;

  const handleChoice = (value) => {
    writeStoredAdConsent(value);
    setConsent(value);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-[120] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 rounded-3xl border border-white/10 bg-[#1d1f22]/96 p-4 text-white shadow-2xl backdrop-blur-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-brand/80">Ad consent</p>
          <h2 className="text-lg font-semibold">Help keep TheMonkeyType free</h2>
          <p className="text-sm leading-7 text-white/70">
            We use ads on parts of the website to support hosting and development. You can accept ad loading now,
            or continue without ad consent. You can also read more on our{" "}
            <Link href="/privacy" className="text-brand hover:text-yellow-300">
              Privacy Policy
            </Link>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="btn-secondary text-sm"
          >
            Continue without ads
          </button>
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="btn-primary text-sm"
          >
            Accept ads
          </button>
        </div>
      </div>
    </div>
  );
}
