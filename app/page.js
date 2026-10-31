import HomePage from "@/components/HomePage";

export const metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "Free Online Typing Trainer to Improve Typing Speed & Accuracy",
    description: "Boost your typing skills with accuracy tracking.",
    url: "https://themonkeytype.com/",
    siteName: "The Monkey Type",
    images: [{ url: "/TMT_Logo_2_new.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
};

export default function Home({ locale = "english" }) {
  return <HomePage locale={locale} />;
}
