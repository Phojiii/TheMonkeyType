import Link from "next/link";
import Footer from "@/components/Footer";
import ProfileView from "@/components/ProfileView";
import { getProfileBundleBySlug } from "@/lib/profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolved = await params;
  const bundle = await getProfileBundleBySlug(resolved.slug);
  const name = bundle?.profile?.displayName || bundle?.profile?.username || "Profile";

  return {
    title: `${name} | TheMonkeyType`,
    description: bundle?.profile?.bio || `${name}'s public typing profile on TheMonkeyType.`,
  };
}

export default async function PublicProfilePage({ params }) {
  const resolved = await params;
  const bundle = await getProfileBundleBySlug(resolved.slug);

  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white md:px-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-white/25">Public profile</p>
            <h1 className="mt-2 text-4xl text-white">Typist showcase</h1>
          </div>
          <Link href="/leaderboard" className="btn-secondary">
            Back to leaderboard
          </Link>
        </div>

        <ProfileView bundle={bundle} />
      </div>
      <Footer />
    </main>
  );
}
