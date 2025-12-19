'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaChartBar,
  FaBell,
  FaUserCircle,
  FaTrophy,
  FaBlog,
} from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ADMINS } from "@/lib/admins";
import AnnouncementModal from "./AnnouncementModal";

const ANNOUNCEMENT_VERSION = "1.0.0"; // Update this to force showing the announcement again

export default function NavBar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const isAdmin = isLoaded && user && ADMINS.includes(user.id);

  const [notifOpen, setNotifOpen] = useState(false);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);

  // ✅ SSR-safe localStorage check
  useEffect(() => {
    const lastSeen = localStorage.getItem("announcement_seen");

    if (lastSeen !== ANNOUNCEMENT_VERSION) {
      setHasNewAnnouncement(true);
      setNotifOpen(true);

      localStorage.setItem("announcement_seen", ANNOUNCEMENT_VERSION);
    }
  }, []);

  const closeAnnouncement = () => {
    setNotifOpen(false);
    setHasNewAnnouncement(false);
  };

  return (
    <>
      {/* 🖥️ Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 h-screen w-20 bg-[#232325] flex-col items-center justify-between py-6 shadow-lg z-50">
        {/* Logo */}
        <Link href="/">
          <Image src="/TMT_Logo.png" alt="TMT Logo" width={60} height={40} priority />
        </Link>

        {/* Menu */}
        <div className="flex flex-col gap-8 flex-1 justify-center">
          <NavLink href="/" icon={<FaHome />} label="Home" active={pathname === "/"} />
          <NavLink href="/stats" icon={<FaChartBar />} label="Stats" active={pathname === "/stats"} />
          <NavLink href="/leaderboard" icon={<FaTrophy />} label="Ranking" active={pathname === "/leaderboard"} />
          <NavLink href="/blog" icon={<FaBlog />} label="Blogs" active={pathname === "/blog"} />
          {isAdmin && (
            <NavLink
              href="/admin/blogs"
              icon={<MdAdminPanelSettings />}
              label="Admin"
              active={pathname === "/admin/blogs"}
            />
          )}
        </div>

        {/* Profile / Notification */}
        <div className="flex flex-col items-center gap-6">
          {/* 🔔 Notification Bell */}
          <button
            onClick={() => setNotifOpen(true)}
            className="relative"
            aria-label="Notifications"
          >
            <FaBell
              className={`text-xl transition
                ${hasNewAnnouncement
                  ? "text-yellow-400 animate-pulse"
                  : "text-white/80 hover:text-yellow-400"}
              `}
            />

            {hasNewAnnouncement && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs rounded-full px-1 text-black font-bold">
                !
              </span>
            )}
          </button>

          {notifOpen && <AnnouncementModal onClose={closeAnnouncement} />}

          {/* Auth */}
          <SignedOut>
            <SignInButton mode="modal">
              <FaUserCircle className="text-2xl text-white/80 hover:text-yellow-400 transition" />
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          </SignedIn>
        </div>
      </nav>

      {/* 📱 Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 w-full bg-[#232325]/95 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 py-2 z-50">
        <Link href="/">
          <Image src="/TMT_Logo.png" alt="TMT Logo" width={42} height={28} priority />
        </Link>

        <div className="flex items-center gap-5">
          <LinkIcon href="/" active={pathname === "/"} icon={<FaHome />} />
          <LinkIcon href="/leaderboard" active={pathname === "/leaderboard"} icon={<FaTrophy />} />
          <LinkIcon href="/blog" active={pathname === "/blog"} icon={<FaBlog />} />
          {isAdmin && <LinkIcon href="/admin/blogs" active={pathname === "/admin/blogs"} icon={<MdAdminPanelSettings />} />}
        </div>

        <button
          onClick={() => setNotifOpen(true)}
          className="relative"
          aria-label="Notifications"
        >
          <FaBell
            className={`text-lg transition
              ${hasNewAnnouncement
                ? "text-yellow-400 animate-pulse"
                : "text-white/80 hover:text-yellow-400"}
            `}
          />
          {hasNewAnnouncement && (
            <span className="absolute -top-1 -right-1 bg-yellow-400 text-[10px] rounded-full px-1 text-black font-bold">
              !
            </span>
          )}
        </button>
      </nav>
    </>
  );
}

/* 🔸 Helpers */
function NavLink({ href, icon, label, active }) {
  return (
    <Link href={href} className="group flex flex-col items-center p-3 rounded-lg hover:bg-yellow-500/20">
      <div className={`text-xl ${active ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 hidden xl:block ${active ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>
        {label}
      </span>
    </Link>
  );
}

function LinkIcon({ href, active, icon }) {
  return (
    <Link href={href}>
      <div className={`text-lg ${active ? "text-yellow-400" : "text-white/80 hover:text-yellow-400"}`}>
        {icon}
      </div>
    </Link>
  );
}
