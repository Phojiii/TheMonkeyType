import { SpeedInsights } from "@vercel/speed-insights/next"
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
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FT5G53V5QP"></script>
        <Script id="gtm-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
          `
        }} />
        <Script
          id="adsense"
          strategy="afterInteractive"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624388385890799"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-4624388385890799" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624388385890799"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}"
                      height="0" width="0" style="display:none;visibility:hidden"></iframe>
            `
          }}
        />
        <NavBar />
        <main className="ml-20 font-mono antialiased">
          {children}
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
