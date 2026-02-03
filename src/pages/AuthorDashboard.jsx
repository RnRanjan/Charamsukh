import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../config';

const AuthorDashboard = ({ user }) => {
  const [stats, setStats] = useState({});
  const [stories, setStories] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'author') return;

    const fetchAuthorData = async () => {
      try {
        const response = await fetch(API.users.authorStats, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setStories(data.stories);
        }
      } catch (error) {
        console.error('Error fetching author data:', error);
      }
    };

    fetchAuthorData();
  }, [user]);

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        const response = await fetch(API.stories.detail(storyId), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          setStories(stories.filter(story => story._id !== storyId));
        }
      } catch (error) {
        console.error('Delete story error:', error);
      }
    }
  };

  const handleGenerateAudio = async (storyId) => {
    try {
      setStories(stories.map(story => 
        story._id === storyId 
          ? { ...story, audioStatus: 'generating' }
          : story
      ));
      
      const response = await fetch(API.stories.detail(storyId) + '/generate-audio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        alert('Audio generation started!');
      }
    } catch (error) {
      console.error('Generate audio error:', error);
    }
  };

  if (!user || user.role !== 'author') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center bg-slate-900/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
          <i className="fas fa-lock text-6xl text-slate-700 mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-white">Author Access Required</h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">This section is reserved for our creative storytellers. Join us to start sharing your stories.</p>
          <Link to="/register" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-600/20">
            Become an Author
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 text-slate-200 selection:bg-accent-500/30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
          <div>
            <h1 className="text-4xl font-bold mb-2 text-white font-serif tracking-tight">Author Dashboard</h1>
            <p className="text-slate-400">
              Manage your masterpieces, track engagement, and reach thousands of readers.
            </p>
          </div>
          <Link 
            to="/create-story"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-primary-600/25 flex items-center group transform hover:scale-105 active:scale-95"
          >
            <i className="fas fa-plus mr-3 group-hover:rotate-90 transition-transform"></i>Create New Story
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-primary-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Stories</p>
                <p className="text-3xl font-black text-white">{stats.totalStories}</p>
              </div>
              <div className="w-12 h-12 bg-primary-600/10 rounded-xl flex items-center justify-center border border-primary-500/20 group-hover:bg-primary-600 transition-all group-hover:text-white">
                <i className="fas fa-book text-xl text-primary-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-green-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Reads</p>
                <p className="text-3xl font-black text-white">{stats.totalReads}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 group-hover:bg-green-500 transition-all group-hover:text-white">
                <i className="fas fa-eye text-xl text-green-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-red-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Likes</p>
                <p className="text-3xl font-black text-white">{stats.totalLikes}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-500 transition-all group-hover:text-white">
                <i className="fas fa-heart text-xl text-red-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl group hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Audio Stories</p>
                <p className="text-3xl font-black text-white">{stats.audioStories}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 transition-all group-hover:text-white">
                <i className="fas fa-volume-up text-xl text-purple-400 group-hover:text-white"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Management */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-10">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-2xl font-bold flex items-center text-white font-serif">
              <i className="fas fa-feather-alt mr-3 text-accent-500"></i>Your Stories
            </h2>
            <div className="flex bg-slate-800 rounded-xl p-1">
              <button className="px-4 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-bold shadow-lg">All</button>
              <button className="px-4 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all">Published</button>
              <button className="px-4 py-1.5 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all">Drafts</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                <tr>
                  <th className="py-4 px-8">Title & Details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Engagement</th>
                  <th className="py-4 px-6">Audio</th>
                  <th className="py-4 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stories.map(story => (
                  <tr key={story._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-6 px-8">
                      <div>
                        <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors mb-1">{story.title}</h3>
                        {story.publishedAt ? (
                          <p className="text-[10px] text-slate-500 flex items-center font-medium">
                            <i className="fas fa-calendar-alt mr-1.5 opacity-60"></i>Published: {new Date(story.publishedAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <p className="text-[10px] text-orange-500/70 font-bold uppercase tracking-wider">Unpublished Draft</p>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <span className="text-[10px] font-bold bg-primary-600/10 text-primary-400 px-3 py-1 rounded-full border border-primary-500/10">
                        {story.category}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                        story.status === 'published' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      } uppercase tracking-wider`}>
                        {story.status}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="flex items-center text-slate-300">
                          <i className="fas fa-eye mr-1.5 text-slate-500"></i>{story.views || 0}
                        </span>
                        <span className="flex items-center text-slate-300">
                          <i className="fas fa-heart mr-1.5 text-slate-500"></i>{story.likes?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      {story.audio?.audioStatus === 'generated' ? (
                        <div className="flex items-center text-green-400 text-xs font-bold">
                          <i className="fas fa-check-circle mr-2"></i>Available
                        </div>
                      ) : story.audio?.audioStatus === 'generating' ? (
                        <div className="flex items-center text-primary-400 text-xs font-bold">
                          <i className="fas fa-spinner fa-spin mr-2"></i>Processing
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerateAudio(story._id)}
                          className="bg-white/5 border border-white/10 hover:border-primary-500/50 hover:bg-primary-600/10 text-slate-400 hover:text-primary-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
                        >
                          <i className="fas fa-magic mr-2 opacity-70"></i>Gen Audio
                        </button>
                      )}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex space-x-3 justify-end">
                        <Link
                          to={`/story/${story._id}`}
                          className="w-9 h-9 flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-primary-600 hover:text-white rounded-xl transition-all"
                          title="View Story"
                        >
                          <i className="fas fa-eye text-sm"></i>
                        </Link>
                        <Link
                          to={`/edit-story/${story._id}`}
                          className="w-9 h-9 flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-accent-600 hover:text-white rounded-xl transition-all"
                          title="Edit Story"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteStory(story._id)}
                          className="w-9 h-9 flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                          title="Delete Story"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {stories.length === 0 && (
            <div className="text-center py-20 bg-white/5 border-t border-white/5">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <i className="fas fa-pen-nib text-3xl text-slate-600"></i>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white font-serif">No stories yet</h3>
              <p className="text-slate-500 mb-10 max-w-xs mx-auto">
                Your journey as an author starts here. Write your first story and share it with the world.
              </p>
              <Link 
                to="/create-story"
                className="bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
              >
                Create Your First Masterpiece
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12">
          <div className="group bg-gradient-to-br from-primary-600 to-indigo-800 p-8 rounded-3xl hover:shadow-2xl hover:shadow-primary-600/30 transition-all transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <i className="fas fa-chart-line text-3xl mb-4 text-white/50 group-hover:text-white transition-colors"></i>
            <h3 className="text-xl font-bold mb-2 text-white font-serif">In-depth Analytics</h3>
            <p className="text-sm text-white/70 mb-6">Detailed insights into reader demographics and behavior</p>
            <button className="bg-white/20 hover:bg-white text-white hover:text-primary-700 text-xs font-bold px-6 py-2.5 rounded-xl transition-all backdrop-blur-md">
              Explore Data
            </button>
          </div>
          
          <div className="group bg-gradient-to-br from-accent-600 to-teal-800 p-8 rounded-3xl hover:shadow-2xl hover:shadow-accent-600/30 transition-all transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <i className="fas fa-users text-3xl mb-4 text-white/50 group-hover:text-white transition-colors"></i>
            <h3 className="text-xl font-bold mb-2 text-white font-serif">Community Hub</h3>
            <p className="text-sm text-white/70 mb-6">Interact with your readers and build your fan base</p>
            <button className="bg-white/20 hover:bg-white text-white hover:text-accent-700 text-xs font-bold px-6 py-2.5 rounded-xl transition-all backdrop-blur-md">
              View Readers
            </button>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-600 to-pink-800 p-8 rounded-3xl hover:shadow-2xl hover:shadow-purple-600/30 transition-all transform hover:-translate-y-1 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <i className="fas fa-cog text-3xl mb-4 text-white/50 group-hover:text-white transition-colors"></i>
            <h3 className="text-xl font-bold mb-2 text-white font-serif">Author Profile</h3>
            <p className="text-sm text-white/70 mb-6">Customize how readers see your professional author page</p>
            <button className="bg-white/20 hover:bg-white text-white hover:text-purple-700 text-xs font-bold px-6 py-2.5 rounded-xl transition-all backdrop-blur-md">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDashboard;
