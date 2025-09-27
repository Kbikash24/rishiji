"use client";
import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Flower,
  Circle,
  MessageCircle,
  Sparkles,
  Clock,
  Menu,
  X,
} from "lucide-react";
import axios from "axios";
import sanitizeHtml from "sanitize-html";

// FlowerBG Component
const FlowerBG = ({ className }) => (
  <div className={`${className} opacity-20`}>
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="flowerGrad" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {[...Array(8)].map((_, i) => (
        <motion.ellipse
          key={i}
          cx="100"
          cy="100"
          rx="40"
          ry="15"
          fill="url(#flowerGrad)"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            transformOrigin: "100px 100px",
            transform: `rotate(${i * 45}deg)`,
          }}
        />
      ))}
    </svg>
  </div>
);

// Enhanced Loader Component
const MotionLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-8 sm:py-16 px-4"
  >
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 sm:border-4 border-amber-300 rounded-full"
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
        className="absolute inset-2 sm:inset-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Flower className="text-white" size={24} />
      </motion.div>
    </div>
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-center"
    >
      <h3 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
        Seeking wisdom from Rishiji...
      </h3>
      <p className="text-sm sm:text-base text-slate-500">
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

export default function ResponsiveAskRishiji() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    if (
      result.includes("<!DOCTYPE html>") ||
      result.includes("<html") ||
      result.includes("<div")
    ) {
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

  const navItems = [
    { label: "Home", href: "#" },
    { label: "About", href: "#about" },
    { label: "Wisdom", href: "#wisdom" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Enhanced Background */}
      <FlowerBG className="fixed inset-0 w-full h-full z-0" />
      <FlowerBG className="fixed left-0 bottom-0 w-1/2 h-1/2 z-0 opacity-40" />
      <MeditatingFigureBG className="fixed left-1/2 top-3/4 w-32 h-32 sm:w-48 sm:h-48 z-0 -translate-x-1/2" />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-56 h-56 sm:w-80 sm:h-80 bg-gradient-to-tr from-yellow-300 to-orange-300 rounded-full blur-3xl"
        />
      </div>
      {/* Enhanced Responsive Navbar */}
      <nav className="fixed top-0 left-0 w-full z-30 bg-white/90 backdrop-blur-xl border-b border-amber-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Flower className="text-white" size={24} />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Ask Rishiji
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 text-gray-700 font-medium">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-amber-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-amber-200/50"
            >
              <div className="px-4 py-2">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block py-3 text-gray-700 hover:text-amber-600 transition-colors border-b border-amber-100/50 last:border-b-0"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-16 sm:h-20" /> {/* Navbar spacer */}
      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 sm:px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Enhanced Logo and Title */}
          <motion.div
            className="mb-8 sm:mb-12"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 150 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-6 sm:mb-8 flex justify-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
                <Flower className="text-white" size={24} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-4 sm:-inset-6 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"
              />
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-gray-800 mb-4 sm:mb-6"
            >
              Ask{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent font-semibold">
                Rishiji
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
            >
              Get personalized spiritual guidance from Rishiji's extensive
              knowledge and experience.
            </motion.p>
          </motion.div>

          {/* Enhanced Responsive Search Box */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mb-6 sm:mb-8"
          >
            <div className="relative max-w-4xl mx-auto">
              {/* Mobile Search Layout */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/95 backdrop-blur-xl border-2 border-amber-200/60 rounded-2xl shadow-2xl shadow-amber-500/20 overflow-hidden hover:shadow-3xl transition-all duration-300">
                <div className="flex items-center flex-1">
                  <div className="pl-4 sm:pl-8 pr-2 sm:pr-4">
                    <Search className="text-amber-500" size={28} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your question about spiritual guidance..."
                    className="flex-1 min-w-0 py-4 sm:py-6 pr-4 sm:pr-8 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-base sm:text-lg"
                  />
                </div>
                <button
                  onClick={handleSearchSubmit}
                  disabled={loading || !searchQuery.trim()}
                  className="mx-2 mb-2 sm:mx-0 sm:mb-0 sm:mr-4 px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm sm:text-base"
                >
                  {loading ? "Asking..." : "Ask"}
                </button>
              </div>
            </div>

            {/* Quick Questions - Responsive Grid */}
            {!loading && !showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-6 sm:mt-8"
              >
                <p className="text-gray-600 mb-3 sm:mb-4 text-base sm:text-lg">
                  Try asking about:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto">
                  {quickQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(question);
                        handleAsk(question);
                      }}
                      className="p-3 sm:px-5 sm:py-3 bg-white/80 border border-amber-200 rounded-full text-xs sm:text-sm text-gray-700 hover:shadow-lg hover:bg-white hover:border-amber-300 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-center"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Section - Responsive */}
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
                {/* Response Card - Responsive */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-amber-200/50 mb-6 sm:mb-8 text-left">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                        Answer from Rishiji
                      </h3>
                      {response.timestamp && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock size={12} />
                            <span>
                              {new Date(response.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {response.is_cached && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs w-fit">
                              Cached ({response.cache_age_days} days old)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HTML Content - Responsive */}
                  {(() => {
                    const htmlContent = extractHtmlFromResult(
                      response.result.replace(/\[EMOJI\]/g, "🙏")
                    );
                    if (htmlContent) {
                      return (
                        <div
                          className="prose prose-sm sm:prose-lg max-w-none text-gray-700 [&>*]:break-words"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(htmlContent, {
                              allowedTags:
                                sanitizeHtml.defaults.allowedTags.concat([
                                  "img",
                                  "h1",
                                  "h2",
                                  "h3",
                                  "h4",
                                  "h5",
                                  "h6",
                                  "div",
                                  "section",
                                  "style",
                                  "iframe",
                                  "blockquote",
                                ]),
                              allowedAttributes: {
                                ...sanitizeHtml.defaults.allowedAttributes,
                                "*": ["class", "id", "style"],
                                img: ["src", "alt", "width", "height"],
                                a: ["href", "target", "rel"],
                                iframe: [
                                  "src",
                                  "width",
                                  "height",
                                  "frameborder",
                                  "allowfullscreen",
                                ],
                              },
                              allowedStyles: {
                                "*": {
                                  "font-family": [/.*/],
                                  "line-height": [/.*/],
                                  margin: [/.*/],
                                  background: [/.*/],
                                  color: [/.*/],
                                  "font-weight": [/.*/],
                                  "font-size": [/.*/],
                                  "max-width": [/.*/],
                                  padding: [/.*/],
                                  border: [/.*/],
                                  "border-radius": [/.*/],
                                  "box-shadow": [/.*/],
                                  "text-align": [/.*/],
                                },
                              },
                            }),
                          }}
                        />
                      );
                    } else {
                      return (
                        <div className="prose prose-sm sm:prose-lg max-w-none text-gray-700">
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

                  {/* Response Metadata - Responsive */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span>Access Count: {response.access_count}</span>
                      <span>Creator: {response.creator_id}</span>
                    </div>
                    {suggestions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} />
                        <span>Related suggestions available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions - Responsive Grid */}
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-amber-200/50"
                  >
                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={20} />
                      You might also be interested in:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleAsk(suggestion);
                          }}
                          className="px-3 sm:px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-xs sm:text-sm text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-all duration-300 cursor-pointer text-center"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State - Responsive */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mt-6 sm:mt-8 p-4 sm:p-6 bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl text-red-700 text-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MessageCircle className="text-red-500" size={24} />
              </div>
              <p className="text-base sm:text-lg mb-3 sm:mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-4 sm:px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
