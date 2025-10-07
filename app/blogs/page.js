'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

import Link from 'next/link';

// Enhanced CSS animations
const cssAnimations = `
  @keyframes float {
    0%, 100% { t            <article className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-amber-200">ansform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); }
    50% { box-shadow: 0 0 30px rgba(251, 146, 60, 0.6); }
  }
  
  .float-animation {
    animation: float 6s ease-in-out infinite;
  }
  
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .card-enter {
    animation: slideInUp 0.6s ease-out forwards;
  }
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Start with empty blogs list; will be fetched from API on mount
const initialBlogs = [];

export default function BlogsPage() {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogContent, setBlogContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Blogs fetched from API
  const [blogs, setBlogs] = useState(initialBlogs);
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
      if (htmlContent.includes('<div class=\"content\">')) {
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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-orange-50">
        
        {/* Header */}
        <div className="bg-white shadow-xl border-b-2 border-amber-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={goBack}
              className="flex items-center text-purple-800 hover:text-amber-600 transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Divine Wisdom
            </button>
          </div>
        </div>

        {/* Blog Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-orange-200">
            {/* Blog Header */}
            <div className="bg-gradient-to-r from-purple-800 to-amber-600 px-8 py-12 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <span className="text-amber-200 text-sm font-medium">Divine Wisdom</span>
                  <div className="text-white/80 text-sm mt-1">By {selectedBlog.author} • {selectedBlog.date}</div>
                  <div className="text-white/60 text-xs mt-1">{selectedBlog.tags && selectedBlog.tags.map(tag => <span key={tag} className="mr-2">#{tag}</span>)}</div>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {selectedBlog.title}
              </h1>
              <div className="mt-6 flex items-center space-x-4 text-amber-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-sm">Spiritually Guided</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-sm">5 min read</span>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="px-8 py-16">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
                  <span className="text-purple-800 font-medium">Receiving divine guidance...</span>
                  <span className="text-gray-500 text-sm mt-2">Rishiji's wisdom is being channeled for your spiritual journey</span>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="px-8 py-8">
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-6">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-amber-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <div>
                      <h3 className="text-amber-800 font-semibold">Divine guidance temporarily unavailable</h3>
                      <p className="text-amber-700 mt-1">{error}</p>
                      <button 
                        onClick={() => fetchBlogContent(selectedBlog.url)}
                        className="mt-3 text-amber-600 hover:text-amber-800 font-medium underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Blog Content */}
            {blogContent && !loading && (
              <div className="px-8 py-8">
                <div className="blog-content prose prose-lg max-w-none">
                  <style jsx>{`
                    .blog-content h1 {
                      color: #6b21a8;
                      font-size: 2rem;
                      font-weight: bold;
                      margin: 2rem 0 1rem 0;
                      border-bottom: 3px solid #d97706;
                      padding-bottom: 0.5rem;
                    }
                    .blog-content h2 {
                      color: #6b21a8;
                      font-size: 1.5rem;
                      font-weight: bold;
                      margin: 1.5rem 0 1rem 0;
                    }
                    .blog-content h3 {
                      color: #075985;
                      font-size: 1.25rem;
                      font-weight: bold;
                      margin: 1rem 0 0.5rem 0;
                    }
                    .blog-content .section {
                      margin: 2rem 0;
                      padding: 1.5rem;
                      background: linear-gradient(135deg, #f0f9ff 0%, #fed7aa 100%);
                      border: 2px solid #fed7aa;
                      border-radius: 1rem;
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .blog-content p {
                      line-height: 1.7;
                      margin: 1rem 0;
                      color: #374151;
                      font-size: 1.1rem;
                    }
                    .blog-content ul, .blog-content ol {
                      margin: 1rem 0;
                      padding-left: 2rem;
                    }
                    .blog-content li {
                      margin: 0.5rem 0;
                      line-height: 1.6;
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
                    .blog-content iframe {
                      max-width: 100%;
                      border-radius: 0.5rem;
                      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                      margin: 1.5rem 0;
                    }
                    .blog-content .media-embed {
                      text-align: center;
                      margin: 2rem 0;
                    }
                  `}</style>
                  <div 
                    dangerouslySetInnerHTML={{ __html: blogContent }}
                  />
                </div>
                
                {/* Share & Actions */}
                <div className="mt-12 pt-8 border-t border-orange-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <span className="text-sky-800 font-medium">Found this helpful?</span>
                      <div className="flex space-x-2">
                        <button className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7.5 15.5l4.5-4.5 4.5 4.5"/>
                          </svg>
                          <span className="text-sm">Helpful</span>
                        </button>
                        <button className="flex items-center space-x-1 px-3 py-1 bg-sky-100 text-sky-700 rounded-full hover:bg-sky-200 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                          </svg>
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>
          
          {/* Related Blogs */}
          {!loading && blogContent && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-sky-800 mb-6">More JEE Preparation Blogs</h3>
              <div className="grid gap-6 md:grid-cols-2">
                {blogs
                  .filter(b => b.url !== selectedBlog.url)
                  .slice(0, 4)
                  .map((blog, index) => (
                    <div
                      key={index}
                      onClick={() => fetchBlogContent(blog.url)}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 p-5 cursor-pointer border border-gray-100 hover:border-orange-300 hover:-translate-y-2 relative overflow-hidden"
                    >
                      {/* Decorative gradient line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-amber-400"></div>
                      
                      {/* Content */}
                      <div className="flex items-start space-x-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-amber-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        
                        {/* Text content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 text-sm leading-tight mb-2 group-hover:text-amber-600 transition-colors duration-300 line-clamp-2">
                            {blog.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-amber-600 font-medium group-hover:text-purple-600 transition-colors duration-300">Read Wisdom →</span>
                            <span className="text-xs text-gray-400">{new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 via-sky-50/50 to-orange-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      {/* Inject custom CSS */}
      <style jsx global>{cssAnimations}</style>
      
      {/* Enhanced Hero Section */}
      

      {/* Blogs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Sacred Teachings &{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Divine Guidance
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in timeless wisdom and spiritual insights that guide seekers toward truth, 
            inner peace, and divine consciousness
          </p>
          <div className="mt-8 w-32 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 mx-auto rounded-full"></div>
          
          {/* Search Input */}
          {/* <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors duration-200"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div> */}
        </div>
        
        {docsLoading ? (
          <div className="text-center py-24">
            <div className="relative">
              {/* Enhanced Loading Animation */}
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-amber-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-orange-500 animate-spin mx-auto" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
            </div>
            <div className="space-y-3">
              <div className="text-slate-800 font-semibold text-lg">Accessing Sacred Wisdom...</div>
              <div className="text-slate-600">Channeling divine teachings for your spiritual journey</div>
              {/* Pulsing dots */}
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        ) : docsError ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-3">Wisdom Temporarily Unavailable</h3>
              <p className="text-red-700 mb-6">{docsError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Reconnect to Divine Source
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {blogs && blogs.length > 0 ? (
              currentBlogs.length > 0 ? (
                currentBlogs.map((blog, index) => {
                  // Calculate the actual index in the original blogs array for random values
                  const actualIndex = blogs.findIndex(b => b.url === blog.url);
                  // Enhanced gradient palette with amber/orange theme
                  const gradients = [
                    'linear-gradient(135deg, #fef7f0 0%, #fed7aa 50%, #fdba74 100%)', // amber
                    'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)', // orange light
                    'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)', // yellow
                    'linear-gradient(135deg, #fef2f2 0%, #fecaca 50%, #fca5a5 100%)', // warm
                    'linear-gradient(135deg, #fff8f1 0%, #ffead5 50%, #fdd5b0 100%)', // peach
                    'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)', // golden
                  ];
                  const accent = gradients[actualIndex % gradients.length];
                  
                  return (
                    <Link
                      key={actualIndex}
                      href={`/blogs/${blog.url}`}
                      title={blog.title}
                      className="group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden card-enter border border-slate-200/50 hover:border-amber-300/50 transform hover:-translate-y-2"
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        background: accent
                      }}
                    >
                      {/* Gradient Overlay for Depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>
                      
                      {/* Content */}
                      <div className="relative p-6 flex flex-col h-full min-h-[280px]">
                        {/* Header with enhanced icon and meta */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div className="text-sm text-amber-700 font-semibold bg-amber-100/80 px-3 py-1.5 rounded-full border border-amber-200/50">
                              {(blog.tags && blog.tags[0]) || 'Sacred Wisdom'}
                            </div>
                          </div>
                          <div className="text-sm text-slate-500 font-medium bg-white/60 px-2 py-1 rounded-lg">
                            {blog.date ? new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                          </div>
                        </div>

                        {/* Enhanced Title */}
                        <h3 className="text-lg font-bold text-slate-800 mb-4 line-clamp-4 leading-tight group-hover:text-amber-700 transition-colors duration-300">
                          {blog.title}
                        </h3>

                        {/* Spacer */}
                        <div className="flex-grow"></div>

                        {/* Enhanced Footer */}
                        <div className="mt-auto pt-4 border-t border-white/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-slate-600">
                              <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                              <span className="font-medium">{randomValues[actualIndex] ?? Math.floor(Math.random() * 100) + 50} seekers</span>
                            </div>
                            <div className="flex items-center text-sm text-amber-600 font-semibold group-hover:text-orange-600 transition-colors duration-300">
                              <span>Explore Wisdom</span>
                              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Decorative elements with enhanced positioning */}
                        <div className="absolute top-4 right-4 w-16 h-16 rounded-full opacity-10 pointer-events-none" style={{background: 'radial-gradient(circle, rgba(245,158,11,0.4), transparent 70%)'}}></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full opacity-5 pointer-events-none" style={{background: 'radial-gradient(circle, rgba(251,146,60,0.5), transparent 70%)'}}></div>
                        
                        {/* Hover overlay effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-slate-500 py-16">
                  <div className="max-w-md mx-auto">
                    <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.33l-.926-.626C6.82 14.945 9.294 14 12 14s5.18.945 7.006 2.704l-.926.627A7.975 7.975 0 0012 15"/>
                    </svg>
                    <p className="text-lg font-medium text-slate-600">No wisdom found</p>
                    <p className="text-slate-500">Your search didn't match any sacred teachings.</p>
                  </div>
                </div>
              )
            ) : (
              <div className="col-span-full text-center text-slate-500 py-16">
                <div className="max-w-md mx-auto">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-lg font-medium text-slate-600">No teachings available</p>
                  <p className="text-slate-500">Sacred wisdom is being prepared for seekers.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Pagination Controls */}
        {!docsLoading && !docsError && filteredBlogs.length > itemsPerPage && (
          <div className="mt-20">
            <div className="flex flex-col items-center space-y-8">
              {/* Pagination Info */}
              <div className="text-sm text-slate-600 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200/50">
                Showing <span className="font-semibold text-indigo-600">{Math.min(startIndex + 1, filteredBlogs.length)}</span> - <span className="font-semibold text-indigo-600">{Math.min(endIndex, filteredBlogs.length)}</span> of <span className="font-semibold text-indigo-600">{filteredBlogs.length}</span> sacred teachings
              </div>
              
              {/* Pagination Buttons */}
              <div className="flex items-center space-x-3">
                {/* Previous Button */}
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentPage === 1
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800 shadow-lg hover:shadow-xl border border-slate-200/50 hover:border-amber-300/50 transform hover:-translate-y-1'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show first page, last page, current page, and pages around current page
                    const showPage = 
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                    
                    // Show ellipsis
                    const showEllipsis = 
                      (pageNum === 2 && currentPage > 4) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 3);

                    if (!showPage && !showEllipsis) {
                      return null;
                    }

                    if (showEllipsis) {
                      return (
                        <span key={`ellipsis-${pageNum}`} className="px-3 py-2 text-slate-400 font-medium">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 text-white shadow-xl transform scale-105 border-2 border-white'
                            : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700 shadow-lg hover:shadow-xl border border-slate-200/50 hover:border-amber-300/50 transform hover:-translate-y-1'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentPage === totalPages
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-amber-700 hover:bg-amber-50 hover:text-amber-800 shadow-lg hover:shadow-xl border border-slate-200/50 hover:border-amber-300/50 transform hover:-translate-y-1'
                  }`}
                >
                  Next
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Quick Jump */}
              {totalPages > 5 && (
                <div className="flex items-center space-x-4 text-sm bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200/50">
                  <span className="text-slate-600 font-medium">Jump to page:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        goToPage(page);
                      }
                    }}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-center focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all duration-200 font-medium"
                  />
                  <span className="text-slate-600 font-medium">of {totalPages}</span>
                </div>
              )}
            </div>
          </div>
        )}  {/* Enhanced CTA Section */}
        <div className="mt-24 relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/80 rounded-3xl"></div>
          <div className="absolute top-8 left-8 w-24 h-24 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-2xl float-animation"></div>
          <div className="absolute bottom-8 right-8 w-20 h-20 bg-gradient-to-br from-orange-200/40 to-yellow-200/40 rounded-full blur-2xl float-animation" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-200/30 to-amber-200/30 rounded-full blur-xl float-animation" style={{animationDelay: '4s'}}></div>
          
          <div className="relative bg-gradient-to-br from-amber-800 via-orange-800 to-yellow-800 rounded-3xl p-12 lg:p-16 text-white border border-amber-300/20 shadow-2xl overflow-hidden">
            {/* Enhanced background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-repeat" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='45' cy='15' r='1'/%3E%3Ccircle cx='15' cy='45' r='1'/%3E%3Ccircle cx='45' cy='45' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            
            {/* Floating orbs */}
            <div className="absolute top-16 right-16 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full blur-xl float-animation"></div>
            <div className="absolute bottom-16 left-16 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-xl float-animation" style={{animationDelay: '3s'}}></div>
            
            <div className="relative z-10 text-center max-w-5xl mx-auto">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center px-6 py-3 bg-white/15 backdrop-blur-md rounded-full text-amber-200 text-sm font-semibold mb-8 border border-white/20 shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Connect with Divine Consciousness
              </div>
              
              <h3 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
                Seeking Deeper{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-300 bg-clip-text text-transparent">
                  Spiritual Awakening?
                </span>
              </h3>
              
              <p className="text-xl lg:text-2xl text-amber-100 mb-12 max-w-4xl mx-auto leading-relaxed">
                Journey beyond words into direct experience of divine truth. Connect with Rishiji's pure consciousness for personalized spiritual guidance, 
                profound meditation practices, and transformative wisdom that awakens your highest potential.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <button className="group bg-gradient-to-r from-white to-amber-50 text-amber-800 px-10 py-5 rounded-2xl font-bold hover:from-amber-50 hover:to-orange-50 transition-all duration-300 border-2 border-transparent hover:border-amber-300/50 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center space-x-3 min-w-[200px]">
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Seek Divine Guidance</span>
                </button>
                
                <button className="group border-2 border-white/40 text-white px-10 py-5 rounded-2xl font-bold hover:bg-white/10 hover:border-white/60 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 backdrop-blur-sm flex items-center space-x-3 min-w-[200px]">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Join Sacred Circle</span>
                </button>
              </div>
              
              {/* Enhanced trust indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 text-amber-200">
                <div className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">5000+</div>
                    <div className="text-sm font-medium">Souls Awakened</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">Pure</div>
                    <div className="text-sm font-medium">Divine Wisdom</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">24/7</div>
                    <div className="text-sm font-medium">Sacred Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
