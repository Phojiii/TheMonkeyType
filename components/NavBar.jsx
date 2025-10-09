'use client';
import Image from "next/image";
import { FaHome, FaKeyboard, FaChartBar, FaCog, FaBell, FaUserCircle } from "react-icons/fa";
import Link from "next/link";

export default function NavBar() {
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
        <Link href="/" className="group flex flex-col items-center">
          <FaHome className="text-xl text-brand group-hover:text-yellow-400 transition" />
          <span className="text-xs text-white/70 mt-1 hidden xl:block">Home</span>
        </Link>
        {/* <Link href="/test" className="group flex flex-col items-center">
          <FaKeyboard className="text-xl text-brand group-hover:text-yellow-400 transition" />
          <span className="text-xs text-white/70 mt-1 hidden xl:block">Test</span>
        </Link> */}
        <Link href="/stats" className="group flex flex-col items-center">
          <FaChartBar className="text-xl text-brand group-hover:text-yellow-400 transition" />
          <span className="text-xs text-white/70 mt-1 hidden xl:block">Stats</span>
        </Link>
        {/* <Link href="/settings" className="group flex flex-col items-center">
          <FaCog className="text-xl text-brand group-hover:text-yellow-400 transition" />
          <span className="text-xs text-white/70 mt-1 hidden xl:block">Settings</span>
        </Link> */}
      </div>
      {/* Profile & Notification */}
      <div className="flex flex-col items-center gap-6">
        <button className="relative group">
          <FaBell className="text-xl text-white/80 group-hover:text-yellow-400 transition" />
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs rounded-full px-1 text-black font-bold">!</span>
        </button>
        <button>
          <FaUserCircle className="text-2xl text-white/80 hover:text-yellow-400 transition" />
        </button>
      </div>
    </nav>
  );
}