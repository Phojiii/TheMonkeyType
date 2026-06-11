export const AD_CONSENT_KEY = "tmt_ad_consent";

export function readStoredAdConsent() {
  if (typeof window === "undefined") return "unknown";

  try {
    const value = localStorage.getItem(AD_CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : "unknown";
  } catch {
    return "unknown";
  }
}

export function writeStoredAdConsent(value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AD_CONSENT_KEY, value);
  } catch {}
}
