import { useState, useEffect } from 'react';
import { API } from '../config';

const AdminStories = ({ user }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const res = await fetch(API.admin.stories, { headers });
      const data = await res.json();
      if (data.success) {
        setStories(data.stories);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = stories.filter(story => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return story.status === 'pending';
    if (filterStatus === 'published') return story.status === 'published';
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Loading stories...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Moderate Stories</h2>
        
        {/* Filter */}
        <div className="flex gap-3">
          {['all', 'pending', 'published'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                filterStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Stories List */}
      <div className="space-y-4">
        {filteredStories.map((story) => (
          <div key={story._id} className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{story.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-3">{story.description?.substring(0, 150)}...</p>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span><i className="fas fa-user mr-2"></i>{story.author?.name}</span>
                  <span><i className="fas fa-folder mr-2"></i>{story.category}</span>
                  <span><i className="fas fa-calendar mr-2"></i>{new Date(story.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                story.status === 'published' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300' :
                'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
              }`}>
                {story.status}
              </span>
            </div>

            {story.audioUrl && (
              <div className="mb-4">
                <audio controls className="w-full h-8">
                  <source src={story.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            <div className="flex gap-3">
              <a href={`/story/${story._id}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
                View
              </a>
              {story.status === 'pending' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          No stories found
        </div>
      )}
    </div>
  );
};

export default AdminStories;
