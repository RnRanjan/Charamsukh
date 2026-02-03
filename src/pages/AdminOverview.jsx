import { useState, useEffect } from 'react';
import { API } from '../config';

const AdminOverview = ({ user }) => {
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

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'fa-users', color: 'bg-blue-100 dark:bg-blue-950 text-blue-600' },
    { label: 'Authors', value: stats.totalAuthors, icon: 'fa-pen', color: 'bg-green-100 dark:bg-green-950 text-green-600' },
    { label: 'Total Stories', value: stats.totalStories, icon: 'fa-book', color: 'bg-purple-100 dark:bg-purple-950 text-purple-600' },
    { label: 'Pending Stories', value: stats.pendingStories, icon: 'fa-hourglass', color: 'bg-orange-100 dark:bg-orange-950 text-orange-600' },
    { label: 'Audio Plays', value: stats.audioPlays, icon: 'fa-play', color: 'bg-pink-100 dark:bg-pink-950 text-pink-600' },
    { label: 'Total Likes', value: stats.totalLikes, icon: 'fa-heart', color: 'bg-red-100 dark:bg-red-950 text-red-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Dashboard Overview</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <i className={`fas ${card.icon} text-xl`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/admin/categories" className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-950 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-folder text-white"></i>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Manage Categories</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Create, edit, delete categories</p>
            </div>
          </a>
          
          <a href="/admin/users" className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-white"></i>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Manage Users</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">View, activate, suspend users</p>
            </div>
          </a>

          <a href="/admin/stories" className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-white"></i>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Moderate Stories</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Review and approve stories</p>
            </div>
          </a>

          <a href="/admin/analytics" className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-bar text-white"></i>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">View Analytics</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Check platform statistics</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
