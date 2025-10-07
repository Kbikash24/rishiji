"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/blogs", label: "Blogs" },
    { href: "#about", label: "About" },
    { href: "#wisdom", label: "Wisdom" },
    { href: "#contact", label: "Contact" }
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-30 glass bg-white/85 backdrop-blur-xl border-b border-yellow-200/40 shadow-lg shadow-yellow-500/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="w-8 h-8 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg glow overflow-hidden"
          >
            <Image 
              src="/logom.webp" 
              alt="Rishiji Logo" 
              width={24} 
              height={24} 
              className="object-cover rounded-full"
            />
          </motion.div>
          <motion.span 
            className="text-lg font-semibold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent group-hover:from-yellow-700 group-hover:via-amber-700 group-hover:to-orange-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            Ask Rishiji
          </motion.span>
        </Link>
        
        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-gray-700 font-medium text-sm">
          {links.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link 
                href={link.href} 
                className="relative group px-3 py-2 rounded-full hover:bg-yellow-50/80 transition-all duration-300"
              >
                <span className="relative z-10 group-hover:text-amber-700 transition-colors duration-300">
                  {link.label}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-200/0 via-amber-200/0 to-orange-200/0 rounded-full"
                  whileHover={{ 
                    background: "linear-gradient(90deg, rgba(254,240,138,0.3), rgba(252,211,77,0.3), rgba(251,191,36,0.3))",
                    scale: 1.1
                  }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="relative z-40 w-10 h-10 rounded-md flex items-center justify-center bg-white/60 backdrop-blur-md border border-yellow-100/40 shadow-sm"
          >
            <span className="sr-only">Menu</span>
            {/* Hamburger bars animated into X using framer-motion variants */}
            <motion.span
              className="absolute block w-5 h-[2px] bg-yellow-700 rounded"
              variants={{
                closed: { rotate: 0, y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } },
                open: { rotate: 45, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
              }}
              initial="closed"
              animate={open ? 'open' : 'closed'}
            />

            <motion.span
              className="absolute block w-5 h-[2px] bg-yellow-700 rounded"
              variants={{
                closed: { opacity: 1, transition: { duration: 0.1 } },
                open: { opacity: 0, transition: { duration: 0.1 } }
              }}
              initial="closed"
              animate={open ? 'open' : 'closed'}
            />

            <motion.span
              className="absolute block w-5 h-[2px] bg-yellow-700 rounded"
              variants={{
                closed: { rotate: 0, y: 6, transition: { type: 'spring', stiffness: 300, damping: 20 } },
                open: { rotate: -45, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }
              }}
              initial="closed"
              animate={open ? 'open' : 'closed'}
            />
          </button>
        </div>
      </div>
      {/* Mobile menu panel */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="md:hidden bg-white/90 backdrop-blur-lg border-b border-yellow-100/40 shadow-md"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-gray-800 hover:bg-yellow-50/80 transition"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;