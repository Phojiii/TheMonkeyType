import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next"
import '../app/globals.css';
import NavBar from '../components/NavBar';
import Script from "next/script";

export const metadata = {
  title: "Typing Trainer",
  description: "Adaptive typing practice that learns your weaknesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FT5G53V5QP"
          strategy="afterInteractive"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-FT5G53V5QP');
            `
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
