"use client";

import Script from "next/script";
import { useAdConsent } from "./useAdConsent";

export default function VignetteBanner() {
  const consent = useAdConsent();

  if (consent !== "accepted") return null;

  return (
    <Script
      id="vignette-ad-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(s){
            s.dataset.zone='11130553';
            s.src='https://n6wxm.com/vignette.min.js';
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
