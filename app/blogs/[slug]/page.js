'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import sanitizeAIHtml from '@/lib/sanitizeHtml';

export default function BlogPage() {
  const { slug } = useParams();
  const [blogContent, setBlogContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setBlogContent('');
    setSuggestions([]);
    setBlogTitle('');
    axios.post(
      "https://vhub-search-191432963656.asia-south2.run.app/vedasis/public/get_question_by_url",
      {
        creator_id: "rishinityapragya",
        url: slug
      },
      { headers: { "Content-Type": "application/json" } }
    )
      .then(res => {
        if (!res.data || !res.data.response) {
          setError('Blog not found.');
          setLoading(false);
          return;
        }
        let htmlContent = res.data.response || '';
        // Try to extract title from response
        const titleMatch = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (titleMatch) setBlogTitle(titleMatch[1]);

        // Extract <body>...</body> if present, otherwise use full response
        let bodyContent = htmlContent;
        const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) bodyContent = bodyMatch[1];

        // Sanitize the HTML to strip unsafe/global styles and map tags to site-friendly classes
        const sanitized = sanitizeAIHtml(bodyContent);
        setBlogContent(sanitized);
        // Fetch suggestions after blog loads
        setSuggestionsLoading(true);
        fetch(
          "https://vhub-search-191432963656.asia-south2.run.app/vedasis/public/search_suggestions",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ creator_id: "rishinityapragya", search_query: titleMatch ? titleMatch[1] : slug }),
          }
        )
          .then(res => res.json())
          .then(data => {
            setSuggestions(data?.suggestions || []);
          })
          .catch(() => setSuggestions([]))
          .finally(() => setSuggestionsLoading(false));
      })
      .catch(() => {
        setError('Blog not found.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (!loading && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 w-full">
        {/* Enhanced Error Page */}
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200/50 rounded-3xl p-12 shadow-xl">
            {/* Error Icon */}
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-red-800 mb-4">Sacred Teaching Not Found</h2>
            <p className="text-lg text-red-700 mb-8 leading-relaxed">The wisdom you seek appears to have moved beyond the visible realm. This teaching may not exist or could not be channeled at this moment.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/blogs" 
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Return to Sacred Wisdom
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="border-2 border-amber-300 text-amber-700 px-8 py-4 rounded-2xl font-semibold hover:bg-amber-50 transition-all duration-300"
              >
                Reconnect to Source
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 w-full">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <article className="glass bg-white/90 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden border border-yellow-200/30 sm:border-2 px-6 sm:px-8">
          {loading ? (
            <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 border-yellow-200 border-t-yellow-500 rounded-full mb-3 sm:mb-4 animate-spin"></div>
                <span className="text-amber-800 font-medium text-sm sm:text-base">Loading sacred wisdom...</span>
                <span className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2 px-2 font-light">Divine guidance is being channeled for your spiritual journey</span>
              </div>
            </div>
          ) : error ? (
            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="bg-amber-50 border border-amber-300 rounded-lg sm:rounded-xl p-4 sm:p-6">
                <div className="flex items-start sm:items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mr-2 sm:mr-3 mt-0.5 sm:mt-0 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-amber-800 font-semibold text-sm sm:text-base">Divine guidance temporarily unavailable</h3>
                    <p className="text-amber-700 mt-1 text-xs sm:text-sm break-words">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="blog-content max-w-none" style={{ padding: 0, background: 'none', boxShadow: 'none' }}>
                  <div dangerouslySetInnerHTML={{ __html: blogContent }} />
                </div>
              </div>
              {/* Seekers also asked section */}
              <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 mt-5">
                <h3 className="text-lg sm:text-xl font-bold text-amber-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm sm:text-lg">People also asked</span>
                </h3>
                {suggestionsLoading ? (
                  <div className="text-slate-500 italic text-sm sm:text-base">Loading divine guidance...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="space-y-2 sm:space-y-3">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="bg-amber-50 hover:bg-orange-50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 cursor-pointer border border-amber-100 hover:border-orange-300 transition text-sm sm:text-base leading-relaxed"
                        onClick={() => {
                          // Navigate to /aisearch with query param
                          window.location.href = `/?query=${encodeURIComponent(s)}`;
                        }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-500 italic text-sm sm:text-base">No guidance found.</div>
                )}
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}