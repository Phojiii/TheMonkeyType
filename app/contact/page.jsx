import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact | TheMonkeyType",
  description: "Contact TheMonkeyType for support, partnerships, bug reports, or general inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
<section className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand/80">Contact</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                  Reach out directly for support, reports, ideas, or partnerships.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
                  If you need help with your account, want to report a bug, discuss a partnership,
                  or send feedback about the project, you can now submit everything directly through
                  the website.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <Link href="/" className="btn-primary">
                    Back to typing test
                  </Link>
                  <Link href="/guide" className="btn-secondary">
                    Read the guide
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-brand">Best for</h2>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-white/72 list-disc pl-5">
                    <li>General support and account issues</li>
                    <li>Bug reports and screenshots</li>
                    <li>Feature suggestions and feedback</li>
                    <li>Challenge or leaderboard concerns</li>
                    <li>Business and collaboration inquiries</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-brand">Response time</h2>
                  <p className="mt-2 text-sm leading-7 text-white/72">
                    We aim to review submissions within 2 to 5 business days, and urgent bug reports are usually checked sooner.
                  </p>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-brand">Direct email</h2>
                  <p className="mt-2 text-sm leading-7 text-white/72">info@lemsee.agency</p>
                </div>
              </div>
            </div>
          </section>

          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}

