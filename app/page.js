"use client";
import { useCallback, useRef, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  Flower,
  Circle,
  MessageCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import axios from "axios";
import sanitizeAIHtml from "../lib/sanitizeHtml";

// Enhanced Loader Component
const MotionLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="relative w-16 h-16 mb-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-3 border-yellow-300 rounded-full"
          animate={{
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 180, 180, 0],
            opacity: [1, 0.6, 0.4, 0.2, 1],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
      <motion.div
        className="absolute inset-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center glow"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Flower className="text-white" size={20} />
      </motion.div>
    </div>
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-center"
    >
      <h3 className="text-lg font-medium bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mb-2">
        Seeking wisdom from Rishiji...
      </h3>
      <p className="text-slate-500 text-sm font-light">
        Please wait while I find the perfect guidance for you.
      </p>
    </motion.div>
  </motion.div>
);

// Typing Animation Component
const TypingText = ({ text, className = "" }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return;

    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [text]);

  return <div className={className}>{displayedText}</div>;
};


import FlowerBG from "./FlowerBG";

const MeditatingFigureBG = ({ className }) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -10, 0],
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    <div className="w-full h-full bg-gradient-to-t from-amber-200/30 to-orange-200/20 rounded-full blur-2xl" />
  </motion.div>
);

function ImprovedAskRishiji() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Extract HTML from markdown code fence
  const extractHtmlFromResult = (result) => {
    if (!result) return null;

    // Check if result contains HTML wrapped in markdown code fence
    if (result.startsWith("```html\n") || result.startsWith("`html\n")) {
      return result
        .replace(/^`{1,3}html\n/, "")
        .replace(/\n`{1,3}$/, "")
        .trim();
    }

    // Check if it's already HTML
    if (result.includes("<!DOCTYPE html>") || result.includes("<html")) {
      return result;
    }

    return null;
  };

  // Fetch suggestions with debouncing
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const res = await axios.post(
          "https://vhub-search-191432963656.asia-south2.run.app/vedasis/public/search_suggestions",
          {
            creator_id: "rishinityapragya",
            html_response: true,
            search_query: q,
          },
          {
            headers: { "Content-Type": "application/json" },
            signal: abortRef.current.signal,
          }
        );

        const suggestionList = res.data.suggestions || [];
        setSuggestions(suggestionList.slice(0, 6));
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.debug("Suggestions error:", err.message);
        }
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [searchQuery]);

  // Handle search/ask functionality
  const handleAsk = useCallback(async (question) => {
    if (!question.trim()) return;

    setLoading(true);
    setShowResults(false);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.post(
        "https://vhub-search-191432963656.asia-south2.run.app/vedasis/public/ai_search",
        {
          creator_id: "rishinityapragya",
          html_response: true,
          search_query: question,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log("API Response:", res.data);
      setResponse(res.data);
      setShowResults(true);
    } catch (error) {
      console.error("API Error:", error);
      setError(
        "Sorry, something went wrong while fetching the answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle automatic search from URL query parameter
  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      const decodedQuery = decodeURIComponent(query);
      setSearchQuery(decodedQuery);
      // Trigger search automatically after a short delay to ensure component is fully mounted
      setTimeout(() => {
        handleAsk(decodedQuery);
      }, 100);
    }
  }, [searchParams, handleAsk]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      handleAsk(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const quickQuestions = [

  "What is invoking infinity?",
  "What is Dharma?",
  "What are the different flavors of ego?",
  "What are the disciplines for a Sadhak?",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Enhanced Background */}
      <FlowerBG className="fixed inset-0 w-full h-full z-0" />
  {/* Additional FlowerBG for layered effect at left corner */}
  <FlowerBG className="fixed left-0 bottom-0 w-1/2 h-1/2 z-0 opacity-40" />
      <MeditatingFigureBG className="fixed left-1/2 top-3/4 w-48 h-48 z-0 -translate-x-1/2" />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-200 to-amber-200 rounded-full blur-3xl animate-float"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-200 to-orange-200 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        />
      </div>
      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Enhanced Logo and Title - hidden when results are shown so only the search stays visible */}
          {!showResults && (
            <motion.div
              className="mb-8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: "spring", stiffness: 150 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  y: [0, -5, 0, -5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6 flex justify-center"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-2xl glow overflow-hidden"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image 
                    src="/logom.webp" 
                    alt="Rishiji Logo" 
                    width={40} 
                    height={40} 
                    className="object-cover rounded-full"
                  />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-6 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 rounded-full blur-xl"
                />
              </motion.div>

              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-4xl md:text-5xl text-gray-800 mb-4 font-light"
              >
                Ask{" "}
                <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent font-semibold">
                  Rishiji
                </span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed font-light"
              >
                Get personalized spiritual guidance from Rishiji&apos;s extensive knowledge and
                experience.
              </motion.p>
            </motion.div>
          )}

          {/* Enhanced Search Box */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mb-6"
          >
            <div className="relative max-w-3xl mx-auto">
              <motion.div
                className="flex items-center glass bg-white/90 backdrop-blur-xl border border-yellow-200/50 rounded-2xl shadow-2xl shadow-yellow-500/10 overflow-hidden hover:shadow-yellow-500/20 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <div className="pl-6 pr-3">
                  <Search className="text-amber-500" size={20} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your question about spiritual guidance..."
                  className="flex-1 min-w-0 py-4 pr-6 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-sm font-light"
                />
                <motion.button
                  onClick={handleSearchSubmit}
                  disabled={loading || !searchQuery.trim()}
                  className="mr-3 px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-medium text-sm hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? "Asking..." : "Ask"}
                </motion.button>
              </motion.div>
            </div>

            {/* Quick Questions */}
            {!loading && !showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6"
              >
                <p className="text-gray-600 mb-3 text-sm font-light">Try asking about:</p>
                <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto">
                  {quickQuestions.map((question, i) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        setSearchQuery(question);
                        handleAsk(question);
                      }}
                      className="px-4 py-2 glass bg-white/70 border border-yellow-200/50 rounded-full text-xs text-gray-700 hover:bg-white/90 hover:border-yellow-300/70 transition-all duration-300 font-light glow"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {loading && <MotionLoader key="loader" />}

            {showResults && response && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto"
              >
                {/* Response Card */}
                <motion.div 
                  className="glass bg-white/85 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-yellow-200/30 mb-6 glow"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                

                  {/* HTML Content */}
                  {(() => {
                    const htmlContent = extractHtmlFromResult(
                      response.result.replace(/\[EMOJI\]/g, "🙏")
                    );
                    if (htmlContent) {
                      return (
                        <div
                          className="prose prose-sm max-w-none text-gray-700 font-light"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeAIHtml(htmlContent),
                          }}
                        />
                      );
                    } else {
                      return (
                        <div className="prose prose-sm max-w-none text-gray-700 font-light">
                          <TypingText
                            text={
                              response.result.replace(/\[EMOJI\]/g, "🙏") ||
                              "No response received."
                            }
                          />
                        </div>
                      );
                    }
                  })()}

                
                </motion.div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass bg-white/75 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-yellow-200/40"
                  >
                    <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={16} />
                      You might also be interested in:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleAsk(suggestion);
                          }}
                          className="px-3 py-2 bg-yellow-50/80 border border-yellow-200/50 rounded-full text-xs text-amber-800 hover:bg-yellow-100/80 hover:border-yellow-300/70 transition-all duration-300 font-light"
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          
          </AnimatePresence>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto mt-6 p-5 glass bg-red-50/90 border border-red-200/50 rounded-2xl text-red-700 text-center shadow-lg"
            >
              <motion.div 
                className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <MessageCircle className="text-red-500" size={18} />
              </motion.div>
              <p className="text-sm mb-3 font-light">{error}</p>
              <motion.button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Dismiss
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function SearchFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-3 mx-auto glow"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Flower className="text-white" size={20} />
        </motion.div>
        <p className="text-gray-600 text-sm font-light">Loading Ask Rishiji...</p>
      </motion.div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function Page() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <ImprovedAskRishiji />
    </Suspense>
  );
}
