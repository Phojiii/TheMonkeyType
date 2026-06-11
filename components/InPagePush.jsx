"use client";

import Script from "next/script";
import { useAdConsent } from "./useAdConsent";

export default function InPagePush() {
  const consent = useAdConsent();

  if (consent !== "accepted") return null;

  return (
    <Script
      id="inpagepush-ad-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(s){
            s.dataset.zone='11124354';
            s.src='https://nap5k.com/tag.min.js';
          })(
            [document.documentElement, document.body]
              .filter(Boolean)
              .pop()
              .appendChild(document.createElement('script'))
          );
        `,
      }}
    />
  );
}
