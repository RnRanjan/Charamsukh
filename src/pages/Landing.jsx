import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API, API_BASE_URL } from '../config';

const Landing = () => {
  const [featuredStories, setFeaturedStories] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API.categories);
        const data = await res.json();
        if (data.success) {
          // Add default color if missing from API
          const categoryList = data.categories.map(c => ({
            name: c.name,
            icon: c.icon || 'fa-book',
            color: c.color || 'bg-primary-600'
          }));
          setCategories(categoryList);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFeaturedStories = async () => {
      try {
        const response = await fetch(API.stories.featured);
        const data = await response.json();
        if (data.success) {
          setFeaturedStories(data.stories);
        }
      } catch (error) {
        console.error('Error fetching featured stories:', error);
      }
    };
    fetchFeaturedStories();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white py-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-500 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-8 tracking-tight">
            Unfold <span className="text-primary-400">Magic</span> with Every Story
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience stories like never before with high-fidelity audio narration and a world-class reading interface.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/stories" 
              className="bg-primary-600 !text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/25 flex items-center justify-center"
            >
              Start Exploring <i className="fas fa-arrow-right ml-3"></i>
            </Link>
            <Link 
              to="/register" 
              className="bg-slate-800 !text-white border border-slate-700 px-10 py-4 rounded-2xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center"
            >
              Become an Author
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-4">Trending Now</h2>
              <div className="w-20 h-1.5 bg-primary-600 rounded-full"></div>
            </div>
            <Link to="/stories" className="text-primary-600 font-bold hover:underline">View all stories</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredStories.map(story => (
              <div key={story._id} className="group bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-primary-600/10 transition-all duration-500">
                <div className="relative h-64 overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  {story.coverImage ? (
                    <img 
                      src={story.coverImage.startsWith('http') ? story.coverImage : `${API_BASE_URL}${story.coverImage}`} 
                      alt={story.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <i className="fas fa-book-open text-5xl text-slate-400"></i>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-primary-600 shadow-sm">
                      {story.category}
                    </span>
                  </div>
                  {story.audio?.hasAudio && (
                    <div className="absolute top-4 right-4 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <i className="fas fa-volume-up"></i>
                    </div>
                  )}
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">{story.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">by <span className="text-slate-900 dark:text-slate-200">{story.author?.name || 'Anonymous'}</span></p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center text-slate-500 text-sm font-semibold">
                      <i className="far fa-clock mr-2"></i>{story.readTime || '5 min'}
                    </div>
                    <Link 
                      to={`/story/${story._id}`}
                      className="bg-accent-500 hover:bg-accent-600 text-slate-900 text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-accent-500/20 active:scale-95"
                    >
                      Read Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map(category => (
              <Link 
                key={category.name}
                to={`/stories?category=${category.name.toLowerCase()}`}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow bg-white dark:bg-gray-700"
              >
                <div className={`${category.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`fas ${category.icon} text-2xl text-white`}></i>
                </div>
                <h3 className="font-semibold">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <i className="fas fa-book-open text-white"></i>
                </div>
                <span className="text-2xl font-bold text-white">CharamSukh</span>
              </div>
              <p className="leading-relaxed">Elevating the art of storytelling through immersive audio and digital reading experiences.</p>
              <div className="flex space-x-5 mt-8">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"><i className="fab fa-twitter"></i></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"><i className="fab fa-instagram"></i></a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"><i className="fab fa-discord"></i></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-8 uppercase tracking-widest text-xs">Explore</h4>
              <ul className="space-y-4">
                <li><Link to="/stories" className="hover:text-primary-400 transition-colors">All Stories</Link></li>
                <li><Link to="/stories?audio=true" className="hover:text-primary-400 transition-colors">Audio Series</Link></li>
                <li><Link to="/stories?category=fantasy" className="hover:text-primary-400 transition-colors">Fantasy Worlds</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-8 uppercase tracking-widest text-xs">Authors</h4>
              <ul className="space-y-4">
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">Publishing Guide</Link></li>
                <li><Link to="/register" className="hover:text-primary-400 transition-colors">Author Benefits</Link></li>
                <li><Link to="/login" className="hover:text-primary-400 transition-colors">Writer Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-8 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4">
                <li><Link to="/help" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
                <li><Link to="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary-400 transition-colors">Terms of Use</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-900 mt-20 pt-10 text-center text-sm">
            <p>&copy; 2026 CharamSukh. Crafted for the love of reading.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;