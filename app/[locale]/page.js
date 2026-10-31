import { notFound } from "next/navigation";
import Home from "../page";
import { languageForLocale, localeParams } from "@/lib/locales";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const language = languageForLocale(locale);

  if (!language) notFound();

  return {
    alternates: { canonical: `/${locale.toUpperCase()}` },
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
