import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = ({ user, setUser, darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
<nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <i className="fas fa-book-open text-xl text-white"></i>
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500">CharamSukh</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/stories" className="font-semibold !text-slate-700 dark:!text-slate-200 hover:!text-primary-600 dark:hover:!text-primary-400 transition-colors">
              Stories
            </Link>
            
            {user ? (
              <>
                {user.role === 'author' && (
                  <Link to="/author" className="font-semibold !text-slate-700 dark:!text-slate-200 hover:!text-primary-600 dark:hover:!text-primary-400 transition-colors">
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="font-semibold !text-slate-700 dark:!text-slate-200 hover:!text-primary-600 dark:hover:!text-primary-400 transition-colors">
                    Admin
                  </Link>
                )}
                {user.role === 'user' && (
                  <Link to="/dashboard" className="font-semibold !text-slate-700 dark:!text-slate-200 hover:!text-primary-600 dark:hover:!text-primary-400 transition-colors">
                    Dashboard
                  </Link>
                )}
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                <button onClick={handleLogout} className="!text-rose-500 hover:!text-rose-600 transition-colors text-sm font-bold">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-semibold !text-slate-700 dark:!text-slate-200 hover:!text-primary-600 dark:hover:!text-primary-400 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 !text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95">
                  Join Now
                </Link>
              </>
            )}
            
            <button onClick={toggleDarkMode} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link to="/stories" className="hover:text-primary-400 transition-colors text-slate-300">
                <i className="fas fa-list mr-2"></i>Stories
              </Link>
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="hover:text-primary-400 transition-colors text-slate-300">
                      <i className="fas fa-cog mr-2"></i>Admin
                    </Link>
                  )}
                  {user.role === 'author' && (
                    <Link to="/author" className="hover:text-primary-400 transition-colors text-slate-300">
                      <i className="fas fa-pen mr-2"></i>Author Dashboard
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <Link to="/dashboard" className="hover:text-primary-400 transition-colors text-slate-300">
                      <i className="fas fa-user mr-2"></i>Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="text-left hover:text-red-600 transition-colors">
                    <i className="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-primary-400 transition-colors text-slate-300">
                    <i className="fas fa-sign-in-alt mr-2"></i>Login
                  </Link>
                  <Link to="/register" className="hover:text-primary-400 transition-colors text-slate-300">
                    <i className="fas fa-user-plus mr-2"></i>Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;