"use client";
import { useEffect } from "react";

export default function AdUnit({
  slot,
  style = { display: "block" },
  format = "auto",
  responsive = true,
}) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // ignore init errors
    }
  }, [slot]); // re-init if slot changes

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-4624388385890799"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : "false"}
    />
  );
}
