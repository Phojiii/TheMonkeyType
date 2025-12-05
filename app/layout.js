import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import NavBar from "../components/NavBar";
import Script from "next/script";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import GoogleTagManager from "@/components/GoogleTagManager";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata = {
  title: "The Monkey Type - Online Typing Trainer",
  description: "Free Online Typing Trainer...",
  metadataBase: new URL("https://themonkeytype.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Monkey Type",
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
  const GTM_ID = "GTM-WCXVWLCJ"; // <-- container ID

  return (
    

    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />

        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624388385890799"
          crossOrigin="anonymous"
        ></script>
        

        <meta name="google-adsense-account" content="ca-pub-4624388385890799" />
        <meta name="monetag" content="0679a59b0ad62add50fe7080c35b59f9"></meta>
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WCXVWLCJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <GoogleTagManager />
        <GoogleAnalytics />
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#E2B714",
              colorBackground: "#323437",
              colorText: "#ffffff",
              fontFamily: "Roboto Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              borderRadius: "5px",
            },
            elements: {
              // Backdrop + modal container
              modalBackdrop: "backdrop-blur-sm bg-black/70 z-[1000]",
              modalContent: "rounded-2xl shadow-2xl border border-white/10 overflow-hidden",
              // Card / header
              card: "bg-[#323437] border border-white/10 rounded-2xl shadow-xl",
              headerTitle: "text-[#E2B714] text-xl",
              headerSubtitle: "text-white/60",
              // Social buttons
              socialButtons: "gap-2",
              socialButtonsBlockButton:
                "bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-lg",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-white/10",
              dividerText: "text-white/50",
              // Inputs
              formFieldLabel: "text-white/70",
              formFieldInput:
                "bg-[#2a2c2e] text-white placeholder-white/40 border border-white/10 focus:ring-2 focus:ring-[#E2B714] focus:border-[#E2B714]/60",
              formFieldInput__error: "border-red-500 focus:ring-red-500",
              // Primary/secondary actions
              formButtonPrimary:
                "bg-[#E2B714] text-[#323437] hover:bg-[#d8a800] rounded-lg font-semibold",
              button:
                "rounded-lg",
              // Footer links
              footer: "-mt-2",
              footerAction__signIn: "text-white/60",
              footerAction__signUp: "text-white/60",
              footerActionLink: "text-[#E2B714] hover:opacity-90",
              // UserButton popover (when signed in)
              userButtonPopoverCard: "bg-[#323437] border border-white/10 shadow-xl",
              userButtonPopoverActionButton:
                "hover:bg-white/10 text-white",
              userPreviewMainIdentifier: "text-white/90",
            },
          }}
        >
        {/* Push page_view on route changes */}
          <NavBar />
          <main className="ml-20 font-mono antialiased">
            {children}
            <Script
              id="monetag-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(s){
                    s.dataset.zone='10282269';
                    s.src='https://nap5k.com/tag.min.js';
                  })([document.documentElement, document.body]
                    .filter(Boolean)
                    .pop()
                    .appendChild(document.createElement('script')));
                `,
              }}
            />
            <Script
              id="monetag-script-2"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(s){
                    s.dataset.zone='10282260';
                    s.src='https://groleegni.net/vignette.min.js';
                  })([document.documentElement, document.body]
                    .filter(Boolean)
                    .pop()
                    .appendChild(document.createElement('script')));
                `,
              }}
            />
          </main>
          <SpeedInsights />
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}