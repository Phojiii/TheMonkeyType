import "./globals.css";
import NavBar from "../components/NavBar";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import Providers from "../components/Providers";

export const metadata = {
  title: "Free Online Typing Trainer to Improve Speed & Accuracy",
  description:
    "Free Online Typing Trainer takes free typing tests, tracks accuracy, and boosts speed effortlessly. Enhance your typing performance with The Monkey Type",
  metadataBase: new URL("https://themonkeytype.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Free Online Typing Trainer to Improve Typing Speed & Accuracy",
    description: "Boost your typing skills with accuracy tracking.",
    url: "https://themonkeytype.com",
    siteName: "The Monkey Type",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  const GTM_ID = "GTM-WCXVWLCJ";

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />

        {/* AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624388385890799"
          crossOrigin="anonymous"
        ></script>

        <meta name="google-adsense-account" content="ca-pub-4624388385890799" />
        <meta name="monetag" content="0679a59b0ad62add50fe7080c35b59f9" />
      </head>

      <body>
        {/* GTM noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WCXVWLCJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Providers>
          <NavBar />
          <main className="md:ml-20 md:mt-0 mt-10 ml-0 font-mono antialiased">
            {children}
          </main>
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
