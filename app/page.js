"use client";
import { useCallback, useRef, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Flower,
  Circle,
  MessageCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import axios from "axios";
import sanitizeHtml from "sanitize-html";

// Enhanced Loader Component
const MotionLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="relative w-20 h-20 mb-6">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-4 border-amber-300 rounded-full"
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
        className="absolute inset-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center"
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
      <h3 className="text-xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
        Seeking wisdom from Rishiji...
      </h3>
      <p className="text-slate-500">
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 relative overflow-hidden">
      {/* Enhanced Background */}
      <FlowerBG className="fixed inset-0 w-full h-full z-0" />
  {/* Additional FlowerBG for layered effect at left corner */}
  <FlowerBG className="fixed left-0 bottom-0 w-1/2 h-1/2 z-0 opacity-40" />
      <MeditatingFigureBG className="fixed left-1/2 top-3/4 w-48 h-48 z-0 -translate-x-1/2" />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300 to-amber-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-yellow-300 to-orange-300 rounded-full blur-3xl"
        />
      </div>
      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Enhanced Logo and Title */}
          <motion.div
            className="mb-12"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 150 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-8 flex justify-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-2xl">
                <Flower className="text-white" size={40} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-6 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl"
              />
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-6xl md:text-7xl text-gray-800 mb-6"
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
              className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Get personalized spiritual guidance from Rishiji&apos;s extensive knowledge and
              experience.
            </motion.p>
          </motion.div>

          {/* Enhanced Search Box */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mb-8"
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="flex items-center bg-white/95 backdrop-blur-xl border-2 border-amber-200/60 rounded-2xl shadow-2xl shadow-amber-500/20 overflow-hidden hover:shadow-3xl transition-all duration-300">
                <div className="pl-8 pr-4">
                  <Search className="text-amber-500" size={28} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your question about spiritual guidance..."
                  className="flex-1 min-w-0 py-6 pr-8 bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-lg"
                />
                <button
                  onClick={handleSearchSubmit}
                  disabled={loading || !searchQuery.trim()}
                  className="mr-4 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? "Asking..." : "Ask"}
                </button>
              </div>
            </div>

            {/* Quick Questions */}
            {!loading && !showResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8"
              >
                <p className="text-gray-600 mb-4 text-lg">Try asking about:</p>
                <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto">
                  {quickQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSearchQuery(question);
                        handleAsk(question);
                      }}
                      className="px-5 py-3 bg-white/80 border border-amber-200 rounded-full text-sm text-gray-700 hover:shadow-lg hover:bg-white hover:border-amber-300 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                    >
                      {question}
                    </button>
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
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-amber-200/50 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Answer from Rishiji
                      </h3>
                      {response.timestamp && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Clock size={14} />
                          <span>
                            {new Date(response.timestamp).toLocaleString()}
                          </span>
                          {response.is_cached && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Cached ({response.cache_age_days} days old)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* HTML Content */}
                  {(() => {
                    const htmlContent = extractHtmlFromResult(
                      response.result.replace(/\[EMOJI\]/g, "🙏")
                    );
                    if (htmlContent) {
                      return (
                        <div
                          className="prose prose-lg max-w-none text-gray-700"
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
                        <div className="prose prose-lg max-w-none text-gray-700">
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

                  {/* Response Metadata */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Access Count: {response.access_count}</span>
                      <span>Creator: {response.creator_id}</span>
                    </div>
                    {suggestions.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} />
                        <span>Related suggestions available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200/50"
                  >
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={20} />
                      You might also be interested in:
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSearchQuery(suggestion);
                            handleAsk(suggestion);
                          }}
                          className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-800 hover:bg-amber-100 hover:border-amber-300 transition-all duration-300 cursor-pointer"
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

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-center"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-red-500" size={24} />
              </div>
              <p className="text-lg mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-medium transition-colors"
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

// Loading component for Suspense fallback
function SearchFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Flower className="text-white animate-pulse" size={32} />
        </div>
        <p className="text-gray-600">Loading Ask Rishiji...</p>
      </div>
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
