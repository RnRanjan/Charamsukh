import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API, API_BASE_URL } from '../config';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API.categories);
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories.map(c => c.name));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const categoryParam = searchParams.get('category');
        let url = API.stories.list;
        const params = new URLSearchParams();
        
        if (categoryParam) {
          params.append('category', categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1));
          setSelectedCategory(categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1));
        }
        
        if (searchTerm) params.append('searchTerm', searchTerm);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
          setStories(data.stories);
          setFilteredStories(data.stories);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };
    
    fetchStories();
  }, [searchParams, searchTerm]); // Search term added to dependencies for real-time filter if needed, or use a button

  // We can remove the local filtering useEffect now as the backend handles it, 
  // or keep it for faster UI response on existing data.
  // I'll keep a simplified version for local search if wanted, 
  // but the main data comes from API.
  
  useEffect(() => {
    // Local filter for category if stories are already loaded
    if (stories.length > 0) {
      let filtered = stories;
      if (selectedCategory) {
        filtered = filtered.filter(story => story.category === selectedCategory);
      }
      setFilteredStories(filtered);
    }
  }, [stories, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-200 selection:bg-accent-500/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white font-serif">Discover Stories</h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Explore thousands of captivating stories from talented authors around the world.
            </p>
          </div>
          
          {/* Mobile Filter Toggle */}
          <button 
            onClick={() => setIsFilterMenuOpen(true)}
            className="lg:hidden flex items-center justify-center space-x-2 bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl text-white font-bold hover:bg-slate-800 transition-all active:scale-95"
          >
            <i className="fas fa-filter text-accent-500"></i>
            <span>Filters & Categories</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:w-72 space-y-6">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="font-semibold mb-4 text-white flex items-center">
                <i className="fas fa-search mr-2 text-primary-400"></i>Search
              </h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search stories..."
                  className="w-full pl-4 pr-10 py-3 bg-slate-800/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search absolute right-3 top-3.5 text-slate-500"></i>
              </div>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="font-semibold mb-4 text-white flex items-center">
                <i className="fas fa-filter mr-2 text-accent-500"></i>Categories
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                    !selectedCategory 
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all ${
                      selectedCategory === category 
                        ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Filter Slide-over Menu */}
          {isFilterMenuOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsFilterMenuOpen(false)}></div>
              <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-slate-900 shadow-2xl p-8 border-l border-white/10 flex flex-col animate-slide-in">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Filters</h2>
                  <button onClick={() => setIsFilterMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Search Stories</h3>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search stories..."
                        className="w-full pl-4 pr-10 py-4 bg-slate-800 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Categories</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => {setSelectedCategory(''); setIsFilterMenuOpen(false);}}
                        className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all ${
                          !selectedCategory 
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                            : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => {setSelectedCategory(category); setIsFilterMenuOpen(false);}}
                          className={`w-full text-left px-5 py-3.5 rounded-2xl transition-all ${
                            selectedCategory === category 
                              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                              : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="mt-8 w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-600/20"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <div className="text-sm text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                Showing <span className="text-white font-semibold">{filteredStories.length}</span> of <span className="text-white font-semibold">{stories.length}</span> stories
              </div>
              <div className="flex items-center space-x-3">
                <select className="bg-slate-900 border border-white/10 text-slate-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:outline-none appearance-none cursor-pointer pr-10 relative">
                  <option>Latest</option>
                  <option>Most Popular</option>
                  <option>Most Liked</option>
                </select>
                <div className="flex bg-slate-900 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Stories Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
              {filteredStories.map(story => (
                <div key={story._id} className={`group bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:shadow-primary-600/10 transition-all duration-300 hover:border-white/20 hover:-translate-y-1 overflow-hidden ${
                  viewMode === 'list' ? 'flex p-5' : ''
                }`}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="h-56 relative bg-slate-800 flex items-center justify-center overflow-hidden">
                        {story.coverImage ? (
                          <img 
                            src={story.coverImage.startsWith('http') ? story.coverImage : `${API_BASE_URL}${story.coverImage}`} 
                            alt={story.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="hidden absolute inset-0 items-center justify-center bg-slate-800">
                          <i className="fas fa-image text-5xl text-slate-700"></i>
                        </div>
                        {!story.coverImage && (
                          <i className="fas fa-image text-5xl text-slate-700 transition-transform duration-500 group-hover:scale-110"></i>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary-600/90 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full backdrop-blur-md">
                            {story.category}
                          </span>
                        </div>
                        {story.hasAudio && (
                          <div className="absolute top-4 right-4 bg-slate-950/80 p-2 rounded-full backdrop-blur-md border border-white/10">
                            <i className="fas fa-volume-up text-accent-500 text-sm"></i>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary-400 transition-colors line-clamp-1">{story.title}</h3>
                        <p className="text-slate-400 text-sm mb-3">by <span className="text-slate-300 font-medium">{story.author?.name || 'Anonymous'}</span></p>
                        <p className="text-sm text-slate-500 mb-6 line-clamp-2 leading-relaxed">{story.description || (story.content ? story.content.substring(0, 100) + '...' : 'No description available')}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center"><i className="fas fa-clock mr-1.5 text-accent-500/70"></i>{story.readTime || '5 min'}</span>
                            <span className="flex items-center"><i className="fas fa-heart mr-1.5 text-primary-500/70"></i>{story.likes?.length || 0}</span>
                          </div>
                          <Link 
                            to={`/story/${story._id}`}
                            className="bg-accent-500 hover:bg-accent-600 text-slate-900 text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all transform group-hover:scale-105 active:scale-95 shadow-lg shadow-accent-500/20"
                          >
                            Read Now
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-40 h-40 shrink-0 relative bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center mr-6">
                        {story.coverImage ? (
                          <img 
                            src={story.coverImage.startsWith('http') ? story.coverImage : `${API_BASE_URL}${story.coverImage}`} 
                            alt={story.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <i className="fas fa-image text-3xl text-slate-700 transition-transform duration-500 group-hover:scale-110"></i>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-40"></div>
                        {story.hasAudio && (
                          <div className="absolute top-2 right-2 bg-slate-950/80 p-1.5 rounded-full backdrop-blur-md border border-white/10">
                            <i className="fas fa-volume-up text-accent-500 text-[10px]"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-primary-400">{story.category}</span>
                            <span className="text-[10px] text-slate-500">{story.publishedAt}</span>
                          </div>
                          <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-primary-400 transition-colors">{story.title}</h3>
                          <p className="text-slate-400 text-sm mb-2">by <span className="text-slate-300 font-medium">{story.author?.name || 'Anonymous'}</span></p>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">{story.description || (story.content ? story.content.substring(0, 150) + '...' : 'No description available')}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex items-center space-x-6 text-xs text-slate-500">
                            <span className="flex items-center"><i className="fas fa-clock mr-1.5 text-accent-500/70"></i>{story.readTime || '5 min'}</span>
                            <span className="flex items-center"><i className="fas fa-heart mr-1.5 text-primary-500/70"></i>{story.likes?.length || 0}</span>
                          </div>
                          <Link 
                            to={`/story/${story._id}`}
                            className="bg-accent-500 hover:bg-accent-600 text-slate-900 text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-accent-500/20"
                          >
                            Read Story
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {filteredStories.length === 0 && (
              <div className="text-center py-24 bg-slate-900/30 border border-dashed border-white/10 rounded-3xl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6">
                  <i className="fas fa-search text-3xl text-slate-600"></i>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white font-serif">No stories found</h3>
                <p className="text-slate-400 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => {setSearchTerm(''); setSelectedCategory('');}}
                  className="mt-8 text-primary-400 font-medium hover:text-primary-300 underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stories;
