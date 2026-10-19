import Link from "next/link";

export default function LocalizedHomeContent({ copy }) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.3em] text-brand/80">{copy.eyebrow}</p>
      <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight text-white md:text-5xl">{copy.title}</h1>
      <p className="mt-6 max-w-4xl text-base leading-8 text-white/75 md:text-lg">{copy.intro}</p>
      <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[0.85fr_1.15fr]">
        <h2 className="text-2xl font-semibold text-white md:text-3xl">{copy.aboutTitle}</h2>
        <p className="text-base leading-8 text-white/70">{copy.about}</p>
      </div>
      <div className="mt-12 border-t border-white/10 pt-10"><h2 className="text-2xl font-semibold text-white md:text-3xl">{copy.featuresTitle}</h2><div className="mt-7 grid gap-4 md:grid-cols-2">{copy.features.map((feature) => <p key={feature} className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/70">{feature}</p>)}</div></div>
      <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-2"><div><h2 className="text-2xl font-semibold text-white md:text-3xl">{copy.howTitle}</h2><p className="mt-4 text-sm leading-7 text-white/70">{copy.how}</p></div><div><h2 className="text-2xl font-semibold text-white md:text-3xl">{copy.measureTitle}</h2><p className="mt-4 text-sm leading-7 text-white/70">{copy.measure}</p></div></div>
      <div className="mt-12 rounded-3xl border border-brand/30 bg-brand/10 p-7 text-center md:p-10"><h2 className="text-2xl font-semibold text-white md:text-3xl">{copy.ctaTitle}</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75">{copy.cta}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="btn-primary">{copy.start}</button><Link href="/leaderboard" className="btn-secondary">{copy.leaderboard}</Link></div></div>
    </>
  );
}
