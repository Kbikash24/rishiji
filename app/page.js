'use client';


import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Flower2 as Lotus,
  Circle
} from 'lucide-react';
import FlowerBG from './FlowerBG';
import MeditatingFigureBG from './MeditatingFigureBG';

export default function AskRishiji() {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    
    // Handle search functionality here
    console.log('Searching for:', searchText);
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-yellow-100 relative overflow-hidden">
  {/* Animated SVG Flower Background */}
  <FlowerBG className="fixed inset-0 w-full h-full z-0" />
  {/* Animated SVG Meditating Figure */}
  <MeditatingFigureBG className="fixed left-1/2 top-3/4 w-[180px] h-[180px] z-0" />
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur-lg border-b border-yellow-200/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lotus className="text-yellow-400" size={28} />
            <span className="text-xl font-semibold text-yellow-700 tracking-wide">Ask Rishiji</span>
          </div>
          <div className="flex gap-6 text-gray-700 font-medium text-base">
            <a href="#" className="hover:text-yellow-400 transition-colors">Home</a>
            <a href="#about" className="hover:text-yellow-600 transition-colors">About</a>
            <a href="#wisdom" className="hover:text-yellow-600 transition-colors">Wisdom</a>
            <a href="#contact" className="hover:text-yellow-600 transition-colors">Contact</a>
          </div>
        </div>
      </nav>
      <div className="h-16" /> {/* Spacer for navbar */}
      {/* Elegant Background Pattern */}
  <div className="absolute inset-0 overflow-hidden z-10">
        {/* More Visible gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
            x: [0, -50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-yellow-400 to-orange-400 rounded-full blur-3xl"
        />
        
        {/* More visible geometric spiritual patterns */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, 360],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
            className={`absolute ${
              i % 4 === 0 ? 'top-20 left-20' :
              i % 4 === 1 ? 'top-40 right-20' : 
              i % 4 === 2 ? 'bottom-40 left-1/4' : 'bottom-20 right-1/4'
            }`}
          >
            <Circle className="text-amber-400/40" size={i % 3 === 0 ? 40 : 32} strokeWidth={1.5} />
          </motion.div>
        ))}

        {/* Large Moving Flower Pattern - Much More Visible */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [0.7, 1.3, 0.7],
            rotate: [0, 360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Large Central Mandala Pattern */}
          <div className="relative">
            {/* Outer flower petals - More Visible */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`petal-${i}`}
                initial={{ rotate: i * 45 }}
                animate={{
                  rotate: [i * 45, i * 45 + 360],
                  scale: [0.8, 1.4, 0.8],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.3
                }}
                className="absolute"
                style={{
                  transformOrigin: '0 200px',
                  left: '50%',
                  top: '50%',
                }}
              >
                <Lotus className="text-amber-500/50" size={48} strokeWidth={1.5} />
              </motion.div>
            ))}
            
            {/* Inner flower ring - More Visible */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`inner-petal-${i}`}
                initial={{ rotate: i * 60 }}
                animate={{
                  rotate: [i * 60, i * 60 - 360],
                  scale: [0.9, 1.5, 0.9],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.2
                }}
                className="absolute"
                style={{
                  transformOrigin: '0 120px',
                  left: '50%',
                  top: '50%',
                }}
              >
                <Lotus className="text-orange-500/60" size={40} strokeWidth={1.5} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating lotus elements - More Visible */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`lotus-${i}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              y: [0, -60, 0],
              x: [0, Math.sin(i * 2) * 30, 0],
              rotate: [0, 25, 0],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1
            }}
            className={`absolute ${
              i % 6 === 0 ? 'top-20 right-20' : 
              i % 6 === 1 ? 'bottom-20 left-20' : 
              i % 6 === 2 ? 'top-1/2 left-10' :
              i % 6 === 3 ? 'top-1/2 right-10' :
              i % 6 === 4 ? 'top-10 left-1/2' : 'bottom-10 right-1/3'
            }`}
          >
            <Lotus 
              className="text-amber-500/50" 
              size={i % 3 === 0 ? 44 : i % 3 === 1 ? 36 : 28} 
              strokeWidth={1.5} 
            />
          </motion.div>
        ))}

        {/* Scattered Small Flowers - More Visible */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`small-flower-${i}`}
            initial={{ 
              opacity: 0,
            }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              y: [0, -70, 0],
              rotate: [0, 270, 360],
              scale: [0.7, 1.4, 0.7],
            }}
            transition={{
              duration: 8 + i * 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
            className="absolute pointer-events-none"
            style={{
              left: `${(i * 7) % 90}%`,
              top: `${(i * 11) % 80}%`,
            }}
          >
            <Lotus 
              className="text-yellow-500/40" 
              size={20 + (i % 3) * 6} 
              strokeWidth={1} 
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo and Title */}
          <motion.div 
            className="mb-12"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative mb-6 flex justify-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <Lotus className="text-white" size={36} />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
                className="absolute -inset-4 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-xl"
              />
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-light text-gray-800 mb-4"
            >
              Ask <span className="bg-gradient-to-r from-yellow-400 to-yellow-400 bg-clip-text text-transparent font-medium">Rishiji</span>
            </motion.h1>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <form onSubmit={handleSearch}>
              <div className="relative max-w-full mx-auto">
                <div className="flex items-center bg-white/90 backdrop-blur-xl border border-amber-200/50 rounded-full shadow-2xl shadow-amber-500/10 overflow-hidden">
                  <div className="pl-6 pr-4">
                    <Search className="text-yellow-400" size={24} />
                  </div>
                  
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Ask your spiritual question..."
                    className="flex-1 min-w-[320px] md:min-w-[480px] lg:min-w-[700px] py-5 pr-6 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-lg"
                  />
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
