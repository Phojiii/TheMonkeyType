import "./globals.css";
import NavBar from "../components/NavBar";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Providers from "../components/Providers";

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  process.env.GOOGLE_SITE_VERIFICATION ||
  "";

export const metadata = {
  title: "Free Online Typing Trainer to Improve Speed & Accuracy",
  description:
    "Free Online Typing Trainer takes free typing tests, tracks accuracy, and boosts speed effortlessly. Enhance your typing performance with The Monkey Type",
  metadataBase: new URL("https://themonkeytype.com"),
  alternates: {
    canonical: "/",
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  openGraph: {
    title: "Free Online Typing Trainer to Improve Typing Speed & Accuracy",
    description: "Boost your typing skills with accuracy tracking.",
    url: "https://themonkeytype.com",
    siteName: "The Monkey Type",
    images: [
      {
        url: "/TMT_Logo_2_new.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5990942569096205" />
        <Script
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5990942569096205"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <NavBar />
          <main className="ml-0 mt-[4.85rem] font-mono antialiased md:ml-20 md:mt-0">
            {children}
          </main>
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
