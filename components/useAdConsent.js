"use client";

import { useEffect, useState } from "react";
import { readStoredAdConsent } from "@/lib/adConsent";

export function useAdConsent() {
  const [consent, setConsent] = useState("unknown");

  useEffect(() => {
    setConsent(readStoredAdConsent());
  }, []);

  return consent;
}
