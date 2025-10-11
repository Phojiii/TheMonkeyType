import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "../app/globals.css";
import NavBar from "../components/NavBar";
import Script from "next/script";
import GTMInitializer from "../components/GTMInitializer"; // <-- client helper
import { Suspense } from "react";

export const metadata = {
  title: "The Monkey Type - Adaptive Typing Practice",
  description: "Adaptive typing practice that learns your weaknesses",
};

export default function RootLayout({ children }) {
  const GTM_ID = "G-FT5G53V5QP"; // <-- container ID

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

        {/* Google AdSense */}
        <Script
          id="adsense"
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624388385890799"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-4624388385890799" />
      </head>
      <body>
        {/* GTM noscript fallback */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Push page_view on route changes */}
        <Suspense fallback={null}>
          <GTMInitializer gtmId={GTM_ID} />
        </Suspense>
        <NavBar />
        <main className="ml-20 font-mono antialiased">
          {children}
          <SpeedInsights />
          <Analytics />
        </main>
      </body>
    </html>
  );
}
