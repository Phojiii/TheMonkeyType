'use client';
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaChartBar, FaBell, FaUserCircle, FaTrophy, FaBlog } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { ADMINS } from "@/lib/admins";

export default function NavBar() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && user && ADMINS.includes(user.id);

  return (
    <nav className="fixed top-0 left-0 h-screen w-20 bg-[#232325] flex flex-col items-center justify-between py-6 shadow-lg z-50">
      {/* Logo */}
      <div className="mb-4">
        <Link href="/">
          <Image
            src="/TMT_Logo.png"
            alt="TMT Logo"
            width={60}
            height={40}
            priority
          />
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-8 flex-1 justify-center">
        <Link
          href="/"
          className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20"
        >
          <FaHome
            className={`text-xl transition-all duration-200 ${
              pathname === "/"
                ? "text-yellow-400"
                : "text-white/80 group-hover:text-yellow-400"
            }`}
          />
          <span
            className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${
              pathname === "/"
                ? "text-yellow-400"
                : "text-white/70 group-hover:text-yellow-400"
            }`}
          >
            Home
          </span>
        </Link>

        <Link
          href="/stats"
          className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20"
        >
          <FaChartBar
            className={`text-xl transition-all duration-200 ${
              pathname === "/stats"
                ? "text-yellow-400"
                : "text-white/80 group-hover:text-yellow-400"
            }`}
          />
          <span
            className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${
              pathname === "/stats"
                ? "text-yellow-400"
                : "text-white/70 group-hover:text-yellow-400"
            }`}
          >
            Stats
          </span>
        </Link>
        <Link href="/leaderboard" className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20">
          <FaTrophy className={`text-xl transition-all duration-200 ${pathname === "/leaderboard" ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`} />
          <span className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${pathname === "/leaderboard" ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>Ranking</span>
        </Link>

        <Link href="/blog" className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20">
          <FaBlog className={`text-xl transition-all duration-200 ${pathname === "/blog" ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`} />
          <span className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${pathname === "/blog" ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>Blogs</span>
        </Link>
        {isAdmin && (
        <Link href="/admin/blogs" className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20">
          <MdAdminPanelSettings  className={`text-xl transition-all duration-200 ${pathname === "/admin/blogs" ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`} />
          <span className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${pathname === "/admin/blogs" ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>Admin</span>
        </Link>
        )}

      </div>

      {/* Profile & Notification */}
      <div className="flex flex-col items-center gap-6">
        {/* Notification */}
        <button
          className="relative group"
          onClick={() => setNotifOpen(!notifOpen)}
        >
          <FaBell className="text-xl text-white/80 group-hover:text-yellow-400 transition" />
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs rounded-full px-1 text-black font-bold">
            !
          </span>
        </button>

        {/* Auth / Profile */}
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="text-2xl text-white/80 hover:text-yellow-400 transition"
              aria-label="Sign in or sign up"
            >
              <FaUserCircle className="text-2xl text-white/80 hover:text-yellow-400 transition" />
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}

