'use client';
import Image from "next/image";
import { FaHome, FaKeyboard, FaChartBar, FaCog, FaBell, FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
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
        <Link href="/" className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20">
          <FaHome className={`text-xl transition-all duration-200 ${pathname === "/" ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`} />
          <span className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${pathname === "/" ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>Home</span>
        </Link>
        
        {/* <Link href="/test" className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20">
          <FaKeyboard className={`text-xl transition-all duration-200 ${pathname === "/test" ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`} />
          <span className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${pathname === "/test" ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>Test</span>
        </Link> */}
        
        <Link href="/stats" className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20">
          <FaChartBar className={`text-xl transition-all duration-200 ${pathname === "/stats" ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`} />
          <span className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${pathname === "/stats" ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>Stats</span>
        </Link>
        
        {/* <Link href="/settings" className="group flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-yellow-500/20">
          <FaCog className={`text-xl transition-all duration-200 ${pathname === "/settings" ? "text-yellow-400" : "text-white/80 group-hover:text-yellow-400"}`} />
          <span className={`text-xs mt-1 hidden xl:block transition-all duration-200 ${pathname === "/settings" ? "text-yellow-400" : "text-white/70 group-hover:text-yellow-400"}`}>Settings</span>
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


