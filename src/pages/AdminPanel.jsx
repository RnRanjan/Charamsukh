import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminCategories from './AdminCategories';
import AdminStories from './AdminStories';
import AdminAnalytics from './AdminAnalytics';

const AdminPanel = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Get current section from URL
  const getSection = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/categories')) return 'categories';
    if (path.includes('/admin/stories')) return 'stories';
    if (path.includes('/admin/analytics')) return 'analytics';
    return 'overview';
  };

  const currentSection = getSection();

  const renderContent = () => {
    switch (currentSection) {
      case 'users':
        return <AdminUsers user={user} />;
      case 'categories':
        return <AdminCategories user={user} />;
      case 'stories':
        return <AdminStories user={user} />;
      case 'analytics':
        return <AdminAnalytics user={user} />;
      default:
        return <AdminOverview user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        currentSection={currentSection}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors md:hidden"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Welcome, {user?.name}
              </span>
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
