'use client';

import { ClerkProvider } from "@clerk/nextjs";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleTagManager from "@/components/GoogleTagManager";
// import SnowfallClient from "@/components/SnowfallClient";

export default function Providers({ children }) {
  return (
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
      {/* <SnowfallClient /> */}
      <GoogleTagManager />
      <GoogleAnalytics />
      {children}
    </ClerkProvider>
  );
}

