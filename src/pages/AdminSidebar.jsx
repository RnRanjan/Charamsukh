import { Link, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isOpen, setIsOpen, currentSection }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'fa-chart-line', path: '/admin' },
    { id: 'users', label: 'Users', icon: 'fa-users', path: '/admin/users' },
    { id: 'categories', label: 'Categories', icon: 'fa-folder', path: '/admin/categories' },
    { id: 'stories', label: 'Stories', icon: 'fa-book', path: '/admin/stories' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar', path: '/admin/analytics' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-cog text-xl text-white"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin</h2>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                currentSection === item.id
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <i className={`fas ${item.icon} w-5`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
