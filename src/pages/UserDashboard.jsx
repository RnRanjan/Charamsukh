import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UserDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [bookmarkedStories, setBookmarkedStories] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [continueReading, setContinueReading] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/users/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setBookmarkedStories(data.bookmarkedStories);
          setReadingHistory(data.readingHistory);
          setContinueReading(data.continueReading);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center bg-slate-900/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
          <i className="fas fa-lock text-6xl text-slate-700 mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-white">Access Denied</h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">Please log in to your account to view your personalized dashboard.</p>
          <Link to="/login" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-600/20">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-200 selection:bg-accent-500/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
          <h1 className="text-4xl font-bold mb-2 text-white font-serif tracking-tight">Welcome back, <span className="text-primary-400">{user.name}</span>!</h1>
          <p className="text-slate-400">
            You've completed <span className="text-white font-medium">85%</span> of your monthly reading goal. Keep it up!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-primary-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Stories Read</p>
                <p className="text-3xl font-black text-white">{stats.storiesRead}</p>
              </div>
              <div className="w-12 h-12 bg-primary-600/10 rounded-xl flex items-center justify-center border border-primary-500/20 group-hover:bg-primary-600 transition-all group-hover:text-white">
                <i className="fas fa-book text-xl text-primary-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-accent-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Hours Listened</p>
                <p className="text-3xl font-black text-white">{stats.hoursListened}</p>
              </div>
              <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center border border-accent-500/20 group-hover:bg-accent-500 transition-all group-hover:text-white">
                <i className="fas fa-headphones text-xl text-accent-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Bookmarks</p>
                <p className="text-3xl font-black text-white">{stats.bookmarks}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 transition-all group-hover:text-white">
                <i className="fas fa-bookmark text-xl text-purple-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-orange-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Favorite Genre</p>
                <p className="text-xl font-black text-white">{stats.favoriteGenre}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 group-hover:bg-orange-500 transition-all group-hover:text-white">
                <i className="fas fa-star text-xl text-orange-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Continue Reading */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-2xl"></div>
            <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
              <i className="fas fa-play-circle mr-3 text-primary-400"></i>Continue Reading
            </h2>
            {continueReading.length > 0 ? (
              <div className="space-y-6">
                {continueReading.map(story => (
                  <div key={story._id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{story.title}</h3>
                        <p className="text-sm text-slate-400">by <span className="text-slate-200">{story.author?.name || 'Anonymous'}</span></p>
                      </div>
                      <span className="text-sm font-bold text-primary-400 bg-primary-400/10 px-3 py-1 rounded-full">{story.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
                      <div 
                        className="bg-primary-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.5)] transition-all duration-1000" 
                        style={{ width: `${story.progress || 0}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 flex items-center">
                        <i className="fas fa-clock mr-1.5"></i>Last read: {story.lastRead || 'Recently'}
                      </span>
                      <Link 
                        to={`/story/${story._id}`}
                        className="bg-accent-500 hover:bg-accent-600 text-slate-900 px-6 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-accent-500/20"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <i className="fas fa-book-open text-4xl text-slate-700 mb-4"></i>
                <p className="text-slate-500 mb-6">No stories in progress</p>
                <Link to="/stories" className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all">
                  Browse Stories
                </Link>
              </div>
            )}
          </div>

          {/* Bookmarked Stories */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
            <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
              <i className="fas fa-bookmark mr-3 text-purple-400"></i>Saved for Later
            </h2>
            {bookmarkedStories.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedStories.map(story => (
                  <div key={story._id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mr-4">
                        <i className="fas fa-image text-slate-600"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight mb-1">{story.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-primary-400">{story.category}</span>
                          <span className="text-[10px] text-slate-500">• {story.author?.name || 'Anonymous'}</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      to={`/story/${story._id}`}
                      className="bg-accent-500 hover:bg-accent-600 text-slate-900 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-accent-500/20"
                    >
                      Read
                    </Link>
                  </div>
                ))}
                <Link 
                  to="/bookmarks" 
                  className="block text-center text-primary-400 hover:text-primary-300 font-medium text-sm mt-6 underline underline-offset-4"
                >
                  View All Bookmarks
                </Link>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                <i className="fas fa-bookmark text-4xl text-slate-700 mb-4"></i>
                <p className="text-slate-500">No bookmarked stories yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Reading History */}
        <div className="mt-10 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center text-white">
              <i className="fas fa-history mr-3 text-accent-500"></i>Reading History
            </h2>
            <button className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Clear History</button>
          </div>
          {readingHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <tr>
                    <th className="py-4 px-8">Story & Author</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-8 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {readingHistory.map(story => (
                    <tr key={story._id || (story.story?._id)} className="hover:bg-white/5 transition-colors group">
                      <td className="py-6 px-8">
                        <div className="font-bold text-white group-hover:text-primary-400 transition-colors">{story.title || story.story?.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">by {story.author?.name || story.story?.author?.name || 'Anonymous'}</div>
                      </td>
                      <td className="py-6 px-4">
                        <span className="text-[10px] font-bold bg-primary-600/10 text-primary-400 px-3 py-1 rounded-full border border-primary-500/10">
                          {story.category || story.story?.category}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        {story.completed ? (
                          <span className="text-xs font-bold text-green-400 flex items-center">
                            <i className="fas fa-check-circle mr-1.5"></i>Completed
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-800 h-1 rounded-full overflow-hidden">
                              <div className="bg-orange-500 h-full" style={{width: `${story.progress || 0}%`}}></div>
                            </div>
                            <span className="text-[10px] font-bold text-orange-400">{story.progress || 0}%</span>
                          </div>
                        )}
                      </td>
                      <td className="py-6 px-4 text-xs text-slate-500 font-medium">{story.readAt || new Date(story.lastRead).toLocaleDateString()}</td>
                      <td className="py-6 px-8 text-right">
                        <Link 
                          to={`/story/${story._id || story.story?._id}`}
                          className="text-xs font-black uppercase tracking-widest text-accent-500 hover:text-white transition-colors flex items-center justify-end"
                        >
                          {story.completed ? 'Read Again' : 'Continue'}
                          <i className="fas fa-arrow-right ml-2 text-[10px]"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <i className="fas fa-history text-5xl text-slate-800 mb-4"></i>
              <p className="text-slate-600">No reading history yet</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          <Link 
            to="/stories"
            className="group bg-gradient-to-br from-primary-600 to-indigo-800 p-8 rounded-3xl hover:shadow-2xl hover:shadow-primary-600/30 transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <i className="fas fa-search text-3xl mb-4 text-white/50 group-hover:text-white transition-colors"></i>
            <h3 className="text-xl font-bold mb-2 text-white font-serif">Discover Stories</h3>
            <p className="text-sm text-white/70">Find your next favorite story among thousands</p>
          </Link>
          
          <Link 
            to="/stories?audio=true"
            className="group bg-gradient-to-br from-accent-600 to-teal-800 p-8 rounded-3xl hover:shadow-2xl hover:shadow-accent-600/30 transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <i className="fas fa-headphones text-3xl mb-4 text-white/50 group-hover:text-white transition-colors"></i>
            <h3 className="text-xl font-bold mb-2 text-white font-serif">Audio Stories</h3>
            <p className="text-sm text-white/70">Listen to immersive narrations while you relax</p>
          </Link>
          
          <Link 
            to="/profile"
            className="group bg-gradient-to-br from-purple-600 to-pink-800 p-8 rounded-3xl hover:shadow-2xl hover:shadow-purple-600/30 transition-all transform hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <i className="fas fa-user-cog text-3xl mb-4 text-white/50 group-hover:text-white transition-colors"></i>
            <h3 className="text-xl font-bold mb-2 text-white font-serif">Profile Settings</h3>
            <p className="text-sm text-white/70">Customize your reading experience and profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
