"use client";

import Script from "next/script";
import { useAdConsent } from "./useAdConsent";

export default function PushNotification() {
  const consent = useAdConsent();

  if (consent !== "accepted") return null;

  return (
    <Script
      src="https://5gvci.com/act/files/tag.min.js?z=11130541"
      data-cfasync="false"
      strategy="afterInteractive"
      async
    />
  );
}
