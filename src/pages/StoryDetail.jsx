import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../config';

const StoryDetail = ({ user }) => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(API.stories.detail(id), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setStory(data.story);
          setComments(data.story.comments || []);
          
          // Check if user has liked this story
          if (user && data.story.likes) {
            const hasLiked = data.story.likes.some(like => 
              (typeof like.user === 'string' ? like.user : like.user?._id) === user._id
            );
            setIsLiked(hasLiked);
          }
        }
      } catch (error) {
        console.error('Error fetching story:', error);
      }
    };
    fetchStory();
  }, [id]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like stories');
      return;
    }

    try {
      const response = await fetch(API.stories.detail(id) + '/like', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsLiked(data.liked);
        setStory({
          ...story,
          likes: data.liked 
            ? [...(story.likes || []), { user: user._id }] 
            : (story.likes || []).filter(l => (typeof l.user === 'string' ? l.user : l.user?._id) !== user._id)
        });
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const response = await fetch(API.stories.detail(id) + '/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ comment: newComment })
      });
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="fas fa-spinner fa-spin text-4xl text-primary-600"></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Story Banner */}
      {story.coverImage && (
        <div className="w-full h-[40vh] relative">
          <img 
            src={story.coverImage.startsWith('http') ? story.coverImage : `${API_BASE_URL}${story.coverImage}`} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>
      )}
      
      <div className={`max-w-4xl mx-auto px-4 ${story.coverImage ? '-mt-32 relative z-10' : 'py-12'}`}>
        {/* Story Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-slate-800 p-10 mb-12 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <Link to="/stories" className="text-primary-600 hover:text-primary-700 font-bold flex items-center group">
              <i className="fas fa-arrow-left mr-3 transform group-hover:-translate-x-1 transition-transform"></i>Back to Library
            </Link>
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
              {story.category}
            </span>
          </div>

          <h1 className="text-5xl font-extrabold mb-8 tracking-tight text-slate-900 dark:text-white leading-tight">{story.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-5">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <i className="fas fa-user text-white text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{story.author?.name || 'Anonymous'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{story.author?.bio}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm font-bold text-slate-400">
              <span className="flex items-center"><i className="far fa-clock mr-2 text-primary-500"></i>{story.readTime || '5 min'}</span>
              <span className="flex items-center"><i className={`fas fa-heart mr-2 ${isLiked ? 'text-rose-500' : 'text-slate-400'}`}></i>{story.likes?.length || 0}</span>
              <span className="flex items-center"><i className="far fa-calendar-alt mr-2 text-cyan-500"></i>{new Date(story.publishedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Audio Player */}
          {story.audio?.hasAudio && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-8 mb-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <button
                    onClick={togglePlayPause}
                    className="w-20 h-20 bg-primary-600 text-white rounded-2xl flex items-center justify-center hover:bg-primary-700 transform hover:scale-105 transition-all shadow-xl shadow-primary-600/30"
                  >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-2xl`}></i>
                  </button>
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center">
                      <i className="fas fa-volume-up mr-3 text-primary-500"></i>Audio Narration
                    </h3>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                      {[0.5, 1, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            playbackRate === rate ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm' : 'text-slate-500'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full accent-primary-600"
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 tabular-nums">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>
              
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              >
                <source src={story.audio?.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold transition-all ${
                isLiked ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <i className={`fas fa-heart ${isLiked ? 'text-rose-500' : ''}`}></i>
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>
            
            <button
              onClick={handleBookmark}
              className={`flex items-center space-x-3 px-6 py-3 rounded-2xl font-bold transition-all ${
                isBookmarked ? 'bg-primary-50 text-primary-600 border border-primary-100' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <i className={`fas fa-bookmark ${isBookmarked ? 'text-primary-500' : ''}`}></i>
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 mb-12">
          <div className="prose prose-xl dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 selection:bg-primary-100 selection:text-primary-900">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-10 leading-relaxed text-2xl font-serif">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-3">
              {story.tags.map(tag => (
                <span key={tag} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-sm rounded-xl">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 p-10 shadow-sm">
          <h3 className="text-3xl font-extrabold mb-10 text-slate-900 dark:text-white">
            <i className="fas fa-comments mr-4 text-primary-500"></i>Comments ({comments.length})
          </h3>
          
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-12">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this story..."
                className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                rows="4"
              ></textarea>
              <button
                type="submit"
                className="mt-4 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
              >
                <i className="fas fa-paper-plane mr-2"></i>Post Comment
              </button>
            </form>
          )}
          
          <div className="space-y-8">
            {comments.map(comment => (
              <div key={comment._id} className="flex space-x-6 group">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 transition-colors">
                  <i className="fas fa-user"></i>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{comment.user?.name || 'User'}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
          
          {!user && (
            <div className="text-center py-10">
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Want to join the conversation? <Link to="/login" className="text-primary-600 font-bold hover:underline">Sign in</Link> to share your thoughts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryDetail;
