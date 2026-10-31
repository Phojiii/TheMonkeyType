import { notFound } from "next/navigation";
import Home from "../page";
import { languageForLocale, localeParams } from "@/lib/locales";
import { LOCALIZED_HOME_COPY } from "@/lib/localizedHomeCopy";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const language = languageForLocale(locale);

  if (!language) notFound();

  return {
    alternates: { canonical: `/${locale.toUpperCase()}` },
    title: LOCALIZED_HOME_COPY[language]?.title || "Free Online Typing Trainer",
    description: LOCALIZED_HOME_COPY[language]?.intro || "Practice typing and improve your speed and accuracy.",
    openGraph: {
      title: LOCALIZED_HOME_COPY[language]?.title || "Free Online Typing Trainer",
      description: LOCALIZED_HOME_COPY[language]?.intro || "Practice typing and improve your speed and accuracy.",
      url: `https://themonkeytype.com/${locale.toUpperCase()}`,
      siteName: "The Monkey Type",
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return localeParams;
}

export default async function LocalizedHome({ params }) {
  const { locale } = await params;
  const language = languageForLocale(locale);

  if (!language) notFound();

  return <Home locale={language} />;
}
