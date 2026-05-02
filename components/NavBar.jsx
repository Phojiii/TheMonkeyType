'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { FaBell, FaBlog, FaChartBar, FaHome, FaInfoCircle, FaTrophy, FaUserCircle } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { MdAdminPanelSettings } from "react-icons/md";
import { ADMINS } from "@/lib/admins";
import AnnouncementModal from "./AnnouncementModal";

const ANNOUNCEMENT_VERSION = "1.0.2";

export default function NavBar() {
  const pathname = usePathname();
  const { user, isLoaded, isSignedIn } = useUser();
  const isAdmin = isLoaded && user && ADMINS.includes(user.id);

  const [notifOpen, setNotifOpen] = useState(false);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);

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

  const mobileLinks = [
    {
      href: "/",
      active: pathname === "/",
      icon: (
        <Image
          src="/TMT_Logo.png"
          alt="TMT"
          width={34}
          height={24}
          priority
          style={{ width: "34px", height: "24px", objectFit: "contain" }}
        />
      ),
      label: "Home",
    },
    { href: "/blog", active: pathname === "/blog", icon: <FaChartBar />, label: "Guides" },
    { href: "/leaderboard", active: pathname === "/leaderboard", icon: <FaTrophy />, label: "Ranking" },
    { href: "/about", active: pathname === "/about", icon: <FaInfoCircle />, label: "About" },
    { href: "/#settings", active: false, icon: <IoSettingsSharp />, label: "Settings" },
  ];

  return (
    <>
      <nav className="fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col items-center justify-between bg-[#23232583] py-6 shadow-lg backdrop-blur-sm md:flex">
        <Link href="/">
          <Image src="/TMT_Logo.png" alt="TMT Logo" width={60} height={40} priority style={{ width: "auto", height: "auto" }} />
        </Link>

        <div className="flex flex-1 flex-col justify-center gap-8">
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

        <div className="flex flex-col items-center gap-6">
          <button onClick={() => setNotifOpen(true)} className="relative" aria-label="Notifications">
            <FaBell
              className={`text-xl transition ${
                hasNewAnnouncement ? "animate-pulse text-yellow-400" : "text-white/80 hover:text-yellow-400"
              }`}
            />
            {hasNewAnnouncement && (
              <span className="absolute -right-2 -top-2 rounded-full bg-yellow-400 px-1 text-xs font-bold text-black">
                !
              </span>
            )}
          </button>

          {!isSignedIn ? (
            <SignInButton mode="modal">
              <FaUserCircle className="text-2xl text-white/80 transition hover:text-yellow-400" />
            </SignInButton>
          ) : (
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          )}
        </div>
      </nav>

      {notifOpen && <AnnouncementModal onClose={closeAnnouncement} />}

      <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/8 bg-[#2f3134]/96 px-4 pb-3 pt-4 backdrop-blur-md md:hidden">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {mobileLinks.map((link) => (
                <MobileLink key={link.href + link.label} href={link.href} active={link.active} icon={link.icon} label={link.label} />
              ))}
              {isAdmin && (
                <MobileLink
                  href="/admin/blogs"
                  active={pathname === "/admin/blogs"}
                  icon={<MdAdminPanelSettings />}
                  label="Admin"
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setNotifOpen(true)}
                className="relative rounded-xl p-2 text-white/55 transition hover:bg-white/5 hover:text-white"
                aria-label="Notifications"
              >
                <FaBell
                  className={`text-base transition ${
                    hasNewAnnouncement ? "animate-pulse text-yellow-400" : "text-white/55 hover:text-yellow-400"
                  }`}
                />
                {hasNewAnnouncement && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-black">
                    !
                  </span>
                )}
              </button>

              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <button className="rounded-xl p-2 text-white/55 transition hover:bg-white/5 hover:text-white" aria-label="Sign in">
                    <FaUserCircle className="text-base" />
                  </button>
                </SignInButton>
              ) : (
                <UserButton appearance={{ elements: { avatarBox: "w-7 h-7" } }} />
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function NavLink({ href, icon, label, active }) {
  return (
    <Link href={href} className="group flex flex-col items-center rounded-lg p-3 hover:bg-yellow-500/20">
      <div className={`text-xl ${active ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`}>{icon}</div>
      <span className={`mt-1 hidden text-xs xl:block ${active ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>
        {label}
      </span>
    </Link>
  );
}

function MobileLink({ href, active, icon, label }) {
  return (
    <Link href={href} aria-label={label}>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
          active
            ? "border-yellow-400/70 bg-yellow-400/10 text-yellow-400 shadow-[0_0_14px_rgba(226,183,20,0.18)]"
            : "border-transparent text-white/40 hover:border-white/10 hover:bg-white/5 hover:text-white/80"
        }`}
      >
        {icon}
      </div>
    </Link>
  );
}
