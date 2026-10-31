"use client";

import { useEffect } from "react";

export default function SiteProtection() {
  useEffect(() => {
    const blockContextMenu = (event) => event.preventDefault();
    const blockDevToolsShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey;
      const devToolsCombo = modifier && event.shiftKey && ["i", "j", "c", "k"].includes(key);
      const sourceCombo = modifier && key === "u";

      if (event.key === "F12" || devToolsCombo || sourceCombo) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    window.addEventListener("keydown", blockDevToolsShortcuts, true);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      window.removeEventListener("keydown", blockDevToolsShortcuts, true);
    };
  }, []);

  return null;
}
