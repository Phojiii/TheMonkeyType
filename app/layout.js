import { SpeedInsights } from "@vercel/speed-insights/next"
import '../app/globals.css';
import NavBar from '../components/NavBar';

export const metadata = {
  title: "Typing Trainer",
  description: "Adaptive typing practice that learns your weaknesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4624388385890799" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4624388385890799"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <NavBar />
        <main className="ml-20 font-mono antialiased">
          {children}
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
