export const LOCALE_PATHS = {
  english: "",
  mandarin: "ZH",
  hindi: "HI",
  spanish: "ES",
  french: "FR",
  arabic: "AR",
  bengali: "BN",
  portuguese: "PT",
  russian: "RU",
  urdu: "UR",
  indonesian: "ID",
  german: "DE",
  japanese: "JA",
  punjabi: "PA",
  sindhi: "SD",
};

export const localePathForLanguage = (language) => {
  const code = LOCALE_PATHS[language];
  return code ? `/${code}` : "/";
};

export const languageForLocale = (locale) => {
  const normalized = String(locale || "").toUpperCase();
  return Object.entries(LOCALE_PATHS).find(([, code]) => code === normalized)?.[0] || null;
};

export const localeParams = Object.values(LOCALE_PATHS)
  .filter(Boolean)
  .map((locale) => ({ locale }));
