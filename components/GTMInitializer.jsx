'use client';
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GTMInitializer({ gtmId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gtmId) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_location: window.location.origin + url,
      page_path: pathname,
      page_title: document.title,
    });
  }, [gtmId, pathname, searchParams]);

  return null;
}
