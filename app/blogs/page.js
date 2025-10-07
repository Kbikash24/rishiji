'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Enhanced CSS animations with new color palette
const cssAnimations = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-8px) rotate(1deg); }
    66% { transform: translateY(4px) rotate(-1deg); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
    50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.6); }
  }
  
  .float-animation {
    animation: float 6s ease-in-out infinite;
  }
  
  .shimmer {
    background: linear-gradient(90deg, #fef3c7 25%, #fde68a 50%, #fef3c7 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .glass {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
`;

export default function BlogsPage() {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogContent, setBlogContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Blogs fetched from API
  const [blogs, setBlogs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState('');

  // Store random values for each blog card
  const [randomValues, setRandomValues] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // Generate a random value for each blog card on the client only
    if (Array.isArray(blogs)) {
      setRandomValues(blogs.map(() => Math.floor(Math.random() * 500) + 100));
    }
  }, [blogs]);

  // Pagination logic
  const filteredBlogs = blogs.filter(b => (b.title || '').toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Fetch documents from the search service and map to blog objects
  useEffect(() => {
    const fetchDocs = async () => {
      setDocsLoading(true);
      setDocsError('');
      try {
        const res = await axios.post(
          "https://vhub-search-191432963656.asia-south2.run.app/vedasis/public/get_docs",
          {
            creator_id: "rishinityapragya",
            page: 1,
            page_size: 40
          },
          { headers: { "Content-Type": "application/json" } }
        );

        // Expecting response like { documents: [ { content, url, updated_at }, ... ] }
        const docs = (res.data && res.data.documents) ? res.data.documents : [];

        const mapped = docs.map(d => ({
          title: (d.content || '').toString().trim(),
          url: d.url,
          author: 'SelfPadhai Experts',
          date: d.updated_at ? new Date(d.updated_at).toISOString().split('T')[0] : null,
          tags: []
        }));

        setBlogs(mapped);
      } catch (err) {
        console.error('Error fetching docs:', err);
        setDocsError('Failed to load blogs.');
      } finally {
        setDocsLoading(false);
      }
    };

    fetchDocs();
  }, []);

  const fetchBlogContent = async (url) => {
    setSelectedBlog(blogs.find(b => b.url === url));
    setLoading(true);
    setError('');
    setBlogContent('');
    try {
      const res = await axios.post(
        "https://vhub-search-191432963656.asia-south2.run.app/vedasis/public/get_question_by_url",
        { 
          creator_id: "rishinityapragya",
          url: url 
        },
        { headers: { "Content-Type": "application/json" } }
      );
      // Extract HTML content from the response
      let htmlContent = res.data.response;
      // Remove the HTML document structure and just keep the body content
      if (htmlContent.includes('<body>')) {
        const bodyStart = htmlContent.indexOf('<body>') + 6;
        const bodyEnd = htmlContent.indexOf('</body>');
        htmlContent = htmlContent.substring(bodyStart, bodyEnd);
      }
      // Remove the outer div.content wrapper to avoid double styling
      if (htmlContent.includes('<div class="content">')) {
        const contentStart = htmlContent.indexOf('<div class="content">') + 21;
        const contentEnd = htmlContent.lastIndexOf('</div>');
        htmlContent = htmlContent.substring(contentStart, contentEnd);
      }
      setBlogContent(htmlContent);
    } catch (err) {
      setError('Failed to fetch blog content. Please try again.');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setSelectedBlog(null);
    setBlogContent('');
    setError('');
  };

  if (selectedBlog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
        {/* Header */}
        <div className="glass bg-white/90 shadow-xl border-b border-yellow-200/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <motion.button
              onClick={goBack}
              className="flex items-center text-amber-800 hover:text-yellow-600 transition-colors duration-200 font-medium text-sm"
              whileHover={{ x: -5 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Divine Wisdom
            </motion.button>
          </div>
        </div>

        {/* Blog Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.article 
            className="glass bg-white/90 rounded-2xl shadow-xl overflow-hidden border border-yellow-200/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Blog Header */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-8 text-white">
              <div className="flex items-center space-x-2 mb-3">
                <motion.div 
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </motion.div>
                <div>
                  <span className="text-yellow-200 text-xs font-medium">Divine Wisdom</span>
                  <div className="text-white/80 text-xs mt-1">By {selectedBlog.author} • {selectedBlog.date}</div>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                {selectedBlog.title}
              </h1>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="px-6 py-12">
                <motion.div 
                  className="flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full mb-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="text-amber-800 font-medium text-sm">Receiving divine guidance...</span>
                  <span className="text-gray-500 text-xs mt-1 font-light">Rishiji&#39;s wisdom is being channeled</span>
                </motion.div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="px-6 py-6">
                <motion.div 
                  className="glass bg-red-50/90 border border-red-200/50 rounded-xl p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div>
                      <h3 className="text-red-800 font-medium text-sm">Divine guidance temporarily unavailable</h3>
                      <p className="text-red-700 mt-1 text-xs font-light">{error}</p>
                      <motion.button 
                        onClick={() => fetchBlogContent(selectedBlog.url)}
                        className="mt-2 text-red-600 hover:text-red-800 font-medium underline text-xs"
                        whileHover={{ scale: 1.05 }}
                      >
                        Try again
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
            
            {/* Blog Content */}
            {blogContent && !loading && (
              <motion.div 
                className="px-6 py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="blog-content prose prose-sm max-w-none">
                  <style jsx>{`
                    .blog-content h1 {
                      color: #92400e;
                      font-size: 1.5rem;
                      font-weight: 600;
                      margin: 1.5rem 0 1rem 0;
                      border-bottom: 2px solid #fbbf24;
                      padding-bottom: 0.5rem;
                    }
                    .blog-content h2 {
                      color: #92400e;
                      font-size: 1.25rem;
                      font-weight: 600;
                      margin: 1.25rem 0 0.75rem 0;
                    }
                    .blog-content h3 {
                      color: #0c4a6e;
                      font-size: 1.1rem;
                      font-weight: 600;
                      margin: 1rem 0 0.5rem 0;
                    }
                    .blog-content .section {
                      margin: 1.5rem 0;
                      padding: 1rem;
                      background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
                      border: 1px solid #fed7aa;
                      border-radius: 0.75rem;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .blog-content p {
                      line-height: 1.6;
                      margin: 0.75rem 0;
                      color: #374151;
                      font-size: 0.9rem;
                      font-weight: 300;
                    }
                    .blog-content ul, .blog-content ol {
                      margin: 0.75rem 0;
                      padding-left: 1.5rem;
                    }
                    .blog-content li {
                      margin: 0.5rem 0;
                      line-height: 1.5;
                      font-size: 0.9rem;
                    }
                    .blog-content a {
                      color: #ea580c;
                      text-decoration: none;
                      font-weight: 500;
                      border-bottom: 1px solid #fed7aa;
                      transition: all 0.2s;
                    }
                    .blog-content a:hover {
                      color: #0c4a6e;
                      border-bottom-color: #0c4a6e;
                    }
                  `}</style>
                  <div 
                    dangerouslySetInnerHTML={{ __html: blogContent }}
                  />
                </div>
              </motion.div>
            )}
          </motion.article>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
      {/* Inject custom CSS */}
      <style jsx global>{cssAnimations}</style>
      
      {/* Blogs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-3xl lg:text-4xl font-light text-slate-800 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Sacred Teachings &{" "}
            <span className="bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent font-medium">
              Divine Guidance
            </span>
          </motion.h2>
          <motion.p 
            className="text-sm text-slate-600 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Immerse yourself in timeless wisdom and spiritual insights that guide seekers toward truth, 
            inner peace, and divine consciousness
          </motion.p>
          <motion.div 
            className="mt-6 w-24 h-0.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.6 }}
          />
        </motion.div>
        
        {docsLoading ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative mb-8">
              <motion.div 
                className="w-12 h-12 border-3 border-yellow-200 border-t-yellow-500 rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-0 w-12 h-12 border-3 border-transparent border-r-amber-500 rounded-full mx-auto"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="space-y-2">
              <motion.div 
                className="text-slate-800 font-medium text-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Accessing Sacred Wisdom...
              </motion.div>
              <motion.div 
                className="text-slate-600 text-sm font-light"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Channeling divine teachings for your spiritual journey
              </motion.div>
              <motion.div 
                className="flex justify-center space-x-1 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <motion.div 
                  className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <motion.div 
                  className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div 
                  className="w-1.5 h-1.5 bg-orange-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </motion.div>
            </div>
          </motion.div>
        ) : docsError ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-md mx-auto glass bg-red-50/90 border border-red-200/50 rounded-2xl p-6 shadow-lg">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </motion.div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Wisdom Temporarily Unavailable</h3>
              <p className="text-red-700 mb-4 text-sm font-light">{docsError}</p>
              <motion.button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2 rounded-xl font-medium text-sm hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Reconnect to Divine Source
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {blogs && blogs.length > 0 ? (
              currentBlogs.length > 0 ? (
                currentBlogs.map((blog, index) => {
                  const actualIndex = blogs.findIndex(b => b.url === blog.url);
                  const gradients = [
                    'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fde68a 100%)',
                    'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
                    'linear-gradient(135deg, #fef7f0 0%, #fed7aa 50%, #fdba74 100%)',
                    'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fbbf24 100%)',
                    'linear-gradient(135deg, #fff8f1 0%, #ffead5 50%, #fdd5b0 100%)',
                    'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #facc15 100%)',
                  ];
                  const accent = gradients[actualIndex % gradients.length];
                  
                  return (
                    <motion.div
                      key={actualIndex}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        y: -8, 
                        transition: { duration: 0.2 } 
                      }}
                    >
                      <Link
                        href={`/blogs/${blog.url}`}
                        title={blog.title}
                        className="group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer relative overflow-hidden border border-yellow-200/30 hover:border-yellow-300/50 glass"
                        style={{ 
                          background: accent
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                        
                        <div className="relative p-5 flex flex-col h-full min-h-[240px]">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <motion.div 
                                className="w-8 h-8 bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md"
                                whileHover={{ scale: 1.1, rotate: 360 }}
                                transition={{ duration: 0.6 }}
                              >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </motion.div>
                              <div className="text-xs text-amber-700 font-medium bg-yellow-100/60 px-2 py-1 rounded-full border border-yellow-200/40">
                                Sacred Wisdom
                              </div>
                            </div>
                            <div className="text-xs text-slate-500 font-light bg-white/50 px-2 py-1 rounded-lg">
                              {blog.date ? new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                            </div>
                          </div>

                          <h3 className="text-sm font-medium text-slate-800 mb-3 line-clamp-4 leading-tight group-hover:text-amber-700 transition-colors duration-300">
                            {blog.title}
                          </h3>

                          <div className="flex-grow"></div>

                          <div className="mt-auto pt-3 border-t border-white/40">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-xs text-slate-600">
                                <div className="w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"></div>
                                <span className="font-light">{randomValues[actualIndex] ?? Math.floor(Math.random() * 100) + 50} seekers</span>
                              </div>
                              <div className="flex items-center text-xs text-amber-600 font-medium group-hover:text-orange-600 transition-colors duration-300">
                                <span>Explore</span>
                                <motion.svg 
                                  className="w-3 h-3 ml-1" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                  whileHover={{ x: 2 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </motion.svg>
                              </div>
                            </div>
                          </div>

                          <div className="absolute top-3 right-3 w-12 h-12 rounded-full opacity-8 pointer-events-none" style={{background: 'radial-gradient(circle, rgba(245,158,11,0.2), transparent 70%)'}}></div>
                          <div className="absolute bottom-3 left-3 w-8 h-8 rounded-full opacity-5 pointer-events-none" style={{background: 'radial-gradient(circle, rgba(251,146,60,0.3), transparent 70%)'}}></div>
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/3 via-amber-500/3 to-orange-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-slate-500 py-16">
                  <motion.div 
                    className="max-w-md mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.33l-.926-.626C6.82 14.945 9.294 14 12 14s5.18.945 7.006 2.704l-.926.627A7.975 7.975 0 0012 15"/>
                    </svg>
                    <p className="text-md font-medium text-slate-600">No wisdom found</p>
                    <p className="text-slate-500 text-sm font-light">Your search didn&#39;t match any sacred teachings.</p>
                  </motion.div>
                </div>
              )
            ) : (
              <div className="col-span-full text-center text-slate-500 py-16">
                <motion.div 
                  className="max-w-md mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-md font-medium text-slate-600">No teachings available</p>
                  <p className="text-slate-500 text-sm font-light">Sacred wisdom is being prepared for seekers.</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}