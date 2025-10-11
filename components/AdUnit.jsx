"use client";
import { useEffect, useRef } from "react";

export default function AdUnit({
  slot,
  // For responsive units keep the parent visible and with non-zero width
  style = { display: "block", width: "100%" },
  format = "auto",
  responsive = true,
  // set true for fixed 300x250 etc. (you must provide width/height in style)
  fixed = false,
}) {
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!insRef.current) return;

    const el = insRef.current;
    pushedRef.current = false; // allow re-init if slot prop changes

    // If the element already got pushed (hot reload), skip
    if (el.getAttribute("data-adsbygoogle-status") === "done") {
      pushedRef.current = true;
      return;
    }

    // Wait until the slot has a non-zero width
    const tryPush = () => {
      if (!el || pushedRef.current) return;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const hasSize = w > 0 && (fixed ? h > 0 : true);

      if (hasSize) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        } catch (e) {
          // swallow push errors (often retry works when width becomes > 0)
        }
      }
    };

    // Initial attempt after a tick (layout settle)
    const t = setTimeout(tryPush, 0);

    // Observe size changes for when width becomes > 0
    const ro = new ResizeObserver(() => tryPush());
    ro.observe(el);

    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [slot, fixed]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-4624388385890799"
      data-ad-slot={slot}
      data-ad-format={format}                         // "auto" for responsive
      data-full-width-responsive={responsive ? "true" : "false"}
      {...(isDev ? { "data-adtest": "on" } : {})}     // safe for localhost/dev
    />
  );
}
