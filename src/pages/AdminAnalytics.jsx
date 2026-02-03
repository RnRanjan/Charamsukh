import { useState, useEffect } from 'react';
import { API } from '../config';

const AdminAnalytics = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAuthors: 0,
    totalStories: 0,
    pendingStories: 0,
    audioPlays: 0,
    totalLikes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const res = await fetch(API.admin.stats, { headers });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  const analyticsData = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'fa-users', color: 'bg-blue-100 dark:bg-blue-950', textColor: 'text-blue-600' },
    { label: 'Total Authors', value: stats.totalAuthors, icon: 'fa-pen', color: 'bg-green-100 dark:bg-green-950', textColor: 'text-green-600' },
    { label: 'Total Stories', value: stats.totalStories, icon: 'fa-book', color: 'bg-purple-100 dark:bg-purple-950', textColor: 'text-purple-600' },
    { label: 'Pending Stories', value: stats.pendingStories, icon: 'fa-hourglass', color: 'bg-orange-100 dark:bg-orange-950', textColor: 'text-orange-600' },
    { label: 'Audio Plays', value: stats.audioPlays, icon: 'fa-play', color: 'bg-pink-100 dark:bg-pink-950', textColor: 'text-pink-600' },
    { label: 'Total Likes', value: stats.totalLikes, icon: 'fa-heart', color: 'bg-red-100 dark:bg-red-950', textColor: 'text-red-600' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Platform Analytics</h2>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {analyticsData.map((item) => (
          <div key={item.label} className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${item.color}`}>
                <i className={`fas ${item.icon} text-2xl ${item.textColor}`}></i>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">{item.label}</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Total Users</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Authors</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalAuthors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Regular Users</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers - stats.totalAuthors}</span>
            </div>
          </div>
        </div>

        {/* Content Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Content Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Total Stories</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalStories}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Pending Approval</span>
              <span className="text-2xl font-bold text-orange-600">{stats.pendingStories}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Published Stories</span>
              <span className="text-2xl font-bold text-green-600">{stats.totalStories - stats.pendingStories}</span>
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Engagement Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Audio Plays</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.audioPlays}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Total Likes</span>
              <span className="text-2xl font-bold text-rose-600">{stats.totalLikes}</span>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">System Status</span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                <i className="fas fa-circle text-xs mr-2"></i>Operational
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">All systems running normally</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
