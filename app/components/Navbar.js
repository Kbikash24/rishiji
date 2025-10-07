"use client";
import Link from "next/link";
import { Flower } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <Flower className="text-white" size={20} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Ask Rishiji
          </span>
        </Link>
        <div className="flex gap-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-amber-600 transition-colors">
            Home
          </Link>
          <Link href="/blogs" className="hover:text-amber-600 transition-colors">
            Blogs
          </Link>
          <a href="#about" className="hover:text-amber-600 transition-colors">
            About
          </a>
          <a
            href="#wisdom"
            className="hover:text-amber-600 transition-colors"
          >
            Wisdom
          </a>
          <a
            href="#contact"
            className="hover:text-amber-600 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;