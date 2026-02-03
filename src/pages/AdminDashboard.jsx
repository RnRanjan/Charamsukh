import { useState, useEffect } from 'react';
import { API } from '../config';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAuthors: 0,
    totalStories: 0,
    pendingStories: 0,
    audioPlays: 0,
    totalLikes: 0
  });
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingCategory, setEditingCategory] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'fa-book', color: 'bg-primary-600' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState({ name: '', icon: '', color: '' });

  const categories = allCategories.map(c => c.name);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(API.categories);
        const data = await res.json();
        if (data.success) {
          setAllCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchAdminData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        
        // Fetch stats
        const statsRes = await fetch(API.admin.stats, { headers });
        const statsData = await statsRes.json();
        if (statsData.success) setStats(statsData.stats);

        // Fetch users
        const usersRes = await fetch(API.admin.users, { headers });
        const usersData = await usersRes.json();
        if (usersData.success) setUsers(usersData.users);

        // Fetch stories
        const storiesRes = await fetch(API.admin.stories, { headers });
        const storiesData = await storiesRes.json();
        if (storiesData.success) setStories(storiesData.stories);

      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, [user]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API.admin.categories.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCategory)
      });
      const data = await response.json();
      if (data.success) {
        setAllCategories([...allCategories, data.category]);
        setNewCategory({ name: '', icon: 'fa-book', color: 'bg-primary-600' });
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to remove this category?')) return;
    try {
      const response = await fetch(API.admin.categories.delete(id), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setAllCategories(allCategories.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setEditCategoryData({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategoryId) return;
    try {
      const response = await fetch(`${API.API_BASE_URL}/api/categories/${editingCategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editCategoryData)
      });
      const data = await response.json();
      if (data.success) {
        setAllCategories(allCategories.map(c => 
          c._id === editingCategoryId ? data.category : c
        ));
        setEditingCategoryId(null);
        setEditCategoryData({ name: '', icon: '', color: '' });
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const newStatus = action === 'suspend' ? 'suspended' : 'active';
      const response = await fetch(`${API.API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: newStatus === 'active' })
      });
      
      const data = await response.json();
      if (data.success) {
        setUsers(users.map(u => 
          u._id === userId 
            ? { ...u, isActive: newStatus === 'active', status: newStatus }
            : u
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleStoryAction = async (storyId, action, extraData = {}) => {
    try {
      const body = { ...extraData };
      if (action === 'approved') body.status = 'published';
      if (action === 'rejected') body.status = 'rejected';

      const response = await fetch(API.stories.detail(storyId) + '/moderate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setStories(stories.map(s => 
          s._id === storyId ? data.story : s
        ));
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Moderation error:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center bg-slate-900/50 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl"></div>
          <i className="fas fa-shield-alt text-6xl text-slate-700 mb-6"></i>
          <h2 className="text-3xl font-bold mb-4 text-white">Admin Access Required</h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto">This area is restricted to administrators only. Unauthorized access is prohibited.</p>
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
          <h1 className="text-4xl font-bold mb-2 text-white font-serif tracking-tight">Admin Terminal</h1>
          <p className="text-slate-400">
            Monitor platform health, manage accounts, and moderate community content.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: 'Users', value: stats.totalUsers, icon: 'fa-users', color: 'text-primary-400' },
            { label: 'Authors', value: stats.totalAuthors, icon: 'fa-pen', color: 'text-green-400' },
            { label: 'Stories', value: stats.totalStories, icon: 'fa-book', color: 'text-purple-400' },
            { label: 'Pending', value: stats.pendingStories, icon: 'fa-clock', color: 'text-orange-400' },
            { label: 'Plays', value: stats.audioPlays, icon: 'fa-volume-up', color: 'text-accent-500' },
            { label: 'Likes', value: stats.totalLikes, icon: 'fa-heart', color: 'text-red-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-xl hover:border-white/20 transition-all text-center group">
              <i className={`fas ${stat.icon} text-xl ${stat.color} mb-3 group-hover:scale-110 transition-transform`}></i>
              <p className="text-2xl font-black text-white">{(stat.value || 0).toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden mb-12">
          <div className="border-b border-white/5 bg-white/5">
            <nav className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: 'fa-chart-bar' },
                { id: 'users', label: 'Users', icon: 'fa-users' },
                { id: 'stories', label: 'Moderation', icon: 'fa-gavel' },
                { id: 'categories', label: 'Categories', icon: 'fa-tags' },
                { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-5 px-8 font-bold text-xs uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400 bg-white/5'
                      : 'border-transparent text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className={`fas ${tab.icon} mr-3 opacity-70`}></i>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold mb-6 flex items-center text-white">
                      <span className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></span>
                      Recent Activity
                    </h3>
                    <div className="space-y-6">
                      {[
                        { icon: 'fa-user-plus', color: 'text-green-400', text: '5 new users registered today' },
                        { icon: 'fa-book', color: 'text-primary-400', text: '3 new stories submitted' },
                        { icon: 'fa-volume-up', color: 'text-purple-400', text: '127 audio plays today' }
                      ].map((act, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-xl border border-white/5 group hover:border-white/10 transition-all">
                          <div className={`w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center ${act.color}`}>
                            <i className={`fas ${act.icon}`}></i>
                          </div>
                          <span className="text-sm text-slate-300 font-medium">{act.text}</span>
                          <span className="ml-auto text-[10px] text-slate-500">2h ago</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold mb-6 flex items-center text-white">
                      <span className="w-1.5 h-6 bg-accent-500 rounded-full mr-3"></span>
                      Quick Control
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { icon: 'fa-eye', color: 'text-primary-400', label: 'Review Stories', sub: `${stats.pendingStories} pending` },
                        { icon: 'fa-users', color: 'text-green-400', label: 'User Control', sub: 'Manage accounts' },
                        { icon: 'fa-shield-alt', color: 'text-purple-400', label: 'Security', sub: 'Platform logs' },
                        { icon: 'fa-database', color: 'text-orange-400', label: 'System', sub: 'Cloud status' }
                      ].map((ctrl, i) => (
                        <button key={i} className="p-5 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all text-left group">
                          <i className={`fas ${ctrl.icon} ${ctrl.color} mb-3 group-hover:scale-110 transition-transform`}></i>
                          <p className="font-bold text-white text-sm">{ctrl.label}</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{ctrl.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h3 className="text-xl font-bold text-white">User Management</h3>
                  <div className="flex space-x-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/50 text-sm"
                      />
                    </div>
                    <select className="px-4 py-2 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/50 text-sm appearance-none pr-10">
                      <option>All Roles</option>
                      <option>Users</option>
                      <option>Authors</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                      <tr>
                        <th className="py-4 px-4">User Identity</th>
                        <th className="py-4 px-4">Role</th>
                        <th className="py-4 px-4">Registry Date</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-4 text-right">Administrative Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(user => (
                        <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-6 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-4 border border-white/5">
                                <span className="text-xs font-bold text-primary-400">{user.name?.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-bold text-white group-hover:text-primary-400 transition-colors">{user.name}</p>
                                <p className="text-xs text-slate-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-4">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                              user.role === 'author' 
                                ? 'bg-primary-600/10 text-primary-400 border-primary-500/20' 
                                : 'bg-slate-800 text-slate-400 border-white/10'
                            } uppercase tracking-wider`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-6 px-4 text-xs text-slate-500 font-medium">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="py-6 px-4">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                              user.status === 'active' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            } uppercase tracking-wider`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-6 px-4 text-right">
                            <div className="flex space-x-2 justify-end">
                              <button
                                onClick={() => handleUserAction(user._id, user.status === 'active' ? 'suspend' : 'activate')}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border ${
                                  user.status === 'active'
                                    ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white'
                                    : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500 hover:text-white'
                                }`}
                              >
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                                <i className="fas fa-ellipsis-h"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Stories Tab */}
            {activeTab === 'stories' && (
              <div className="animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h3 className="text-xl font-bold text-white">Content Moderation Queue</h3>
                  <select className="px-4 py-2 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500/50 text-sm appearance-none pr-10">
                    <option>All Pending Items</option>
                    <option>High Priority</option>
                    <option>Reports</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {stories.map(story => (
                    <div key={story._id} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all relative group">
                      {story.status === 'pending' && <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-full"></div>}
                      <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                          <h4 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors font-serif">{story.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
                            {editingCategory === story._id ? (
                              <div className="flex items-center space-x-2">
                                <select 
                                  className="bg-slate-950 border border-primary-500/30 text-primary-400 px-3 py-1 rounded-full text-[10px] font-bold outline-none"
                                  value={story.category}
                                  onChange={(e) => handleStoryAction(story._id, 'update', { category: e.target.value })}
                                >
                                  {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                                <button onClick={() => setEditingCategory(null)} className="text-slate-500 hover:text-white">
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            ) : (
                              <span 
                                onClick={() => setEditingCategory(story._id)}
                                className="text-primary-400 font-bold bg-primary-400/10 px-3 py-1 rounded-full cursor-pointer hover:bg-primary-400/20 transition-all flex items-center"
                              >
                                {story.category}
                                <i className="fas fa-pen ml-2 text-[8px] opacity-50"></i>
                              </span>
                            )}
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Author: <span className="text-slate-200">{story.author?.name || 'Anonymous'}</span></span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">Submitted: {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                          story.status === 'pending' 
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                            : story.status === 'approved'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {story.status}
                        </span>
                      </div>
                      
                      <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 mb-8">
                        <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 italic">
                          "{story.content}"
                        </p>
                        <button className="mt-4 text-[10px] font-bold text-primary-400 hover:text-white transition-colors uppercase tracking-widest underline underline-offset-4">
                          View full transcript
                        </button>
                      </div>
                      
                      {story.status === 'pending' && (
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() => handleStoryAction(story._id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-green-600/20 flex items-center transform hover:scale-105"
                          >
                            <i className="fas fa-check mr-2"></i>Approve Story
                          </button>
                          <button
                            onClick={() => handleStoryAction(story._id, 'rejected')}
                            className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white px-8 py-3 rounded-2xl font-bold transition-all border border-red-600/20 flex items-center transform hover:scale-105"
                          >
                            <i className="fas fa-times mr-2"></i>Reject Story
                          </button>
                          <button className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-2xl font-bold transition-all flex items-center">
                            <i className="fas fa-eye mr-2 text-primary-400"></i>Full Review
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="animate-fadeIn space-y-10">
                <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
                  <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                    <i className="fas fa-plus-circle mr-3 text-primary-400"></i>Create New Category
                  </h3>
                  <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Name</label>
                      <input 
                        type="text" 
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-primary-500"
                        placeholder="e.g. Science Fiction"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Icon (FontAwesome)</label>
                      <input 
                        type="text" 
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-primary-500"
                        placeholder="e.g. fa-rocket"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Color (Tailwind)</label>
                      <input 
                        type="text" 
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white outline-none focus:border-primary-500"
                        placeholder="e.g. bg-blue-500"
                      />
                    </div>
                    <button type="submit" className="bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-all">
                      Add Category
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCategories.map(cat => (
                    <div key={cat._id} className={`bg-white/5 p-6 rounded-2xl border ${editingCategoryId === cat._id ? 'border-primary-500' : 'border-white/5'} flex flex-col group hover:border-white/10 transition-all`}>
                      {editingCategoryId === cat._id ? (
                        <form onSubmit={handleUpdateCategory} className="space-y-4">
                          <input 
                            type="text" 
                            value={editCategoryData.name}
                            onChange={(e) => setEditCategoryData({...editCategoryData, name: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-950 border border-primary-500/30 text-white rounded-lg text-sm outline-none"
                            placeholder="Category Name"
                            required
                          />
                          <input 
                            type="text" 
                            value={editCategoryData.icon}
                            onChange={(e) => setEditCategoryData({...editCategoryData, icon: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-950 border border-primary-500/30 text-white rounded-lg text-sm outline-none"
                            placeholder="Icon (fa-...)"
                          />
                          <input 
                            type="text" 
                            value={editCategoryData.color}
                            onChange={(e) => setEditCategoryData({...editCategoryData, color: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-950 border border-primary-500/30 text-white rounded-lg text-sm outline-none"
                            placeholder="Color (bg-...)"
                          />
                          <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-700">
                              Save
                            </button>
                            <button 
                              type="button"
                              onClick={() => setEditingCategoryId(null)}
                              className="flex-1 bg-slate-700 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                              <div className={`${cat.color || 'bg-slate-800'} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                                <i className={`fas ${cat.icon || 'fa-tag'}`}></i>
                              </div>
                              <div>
                                <p className="font-bold text-white">{cat.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{cat.icon}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditCategory(cat)}
                              className="flex-1 bg-blue-500/10 text-blue-400 text-xs font-bold py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                            >
                              <i className="fas fa-edit mr-1"></i>Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteCategory(cat._id)}
                              className="flex-1 bg-red-500/10 text-red-400 text-xs font-bold py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <i className="fas fa-trash mr-1"></i>Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-10 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/5 rounded-full blur-3xl"></div>
                    <h4 className="text-lg font-bold mb-8 flex items-center text-white">
                      <i className="fas fa-chart-line mr-3 text-primary-400"></i>Growth Trajectory
                    </h4>
                    <div className="h-72 bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                      <i className="fas fa-chart-area text-6xl text-slate-800 mb-4"></i>
                      <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Real-time Visualization</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-accent-600/5 rounded-full blur-3xl"></div>
                    <h4 className="text-lg font-bold mb-8 flex items-center text-white">
                      <i className="fas fa-chart-pie mr-3 text-accent-500"></i>Engagement Distribution
                    </h4>
                    <div className="h-72 bg-slate-950 rounded-2xl flex flex-col items-center justify-center border border-white/5">
                      <i className="fas fa-chart-bar text-6xl text-slate-800 mb-4"></i>
                      <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Category Breakdown</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-600/5 rounded-full blur-[100px]"></div>
                  <h4 className="text-xl font-bold mb-10 text-white font-serif">Immersive Audio Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { val: (stats.audioPlays || 0).toLocaleString(), label: 'Global Audio Plays', color: 'text-primary-400', icon: 'fa-play' },
                      { val: '67%', label: 'Audio Integration', color: 'text-green-400', icon: 'fa-wave-square' },
                      { val: '4.2', label: 'Community Rating', color: 'text-purple-400', icon: 'fa-star' }
                    ].map((m, i) => (
                      <div key={i} className="bg-white/5 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all text-center">
                        <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mx-auto mb-6 border border-white/5 ${m.color}`}>
                          <i className={`fas ${m.icon}`}></i>
                        </div>
                        <p className={`text-4xl font-black mb-2 ${m.color}`}>{m.val}</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
