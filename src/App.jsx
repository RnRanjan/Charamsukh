import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API } from './config';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import UserDashboard from './pages/UserDashboard';
import AuthorDashboard from './pages/AuthorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateStory from './pages/CreateStory';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(API.auth.me, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuth();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', JSON.stringify(!darkMode));
  };

  // Determine basename based on environment
  const basename = process.env.NODE_ENV === 'production' ? '/Charamsukh' : '/';

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors">
        <Router basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Navbar user={user} setUser={setUser} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/story/:id" element={<StoryDetail user={user} />} />
            <Route path="/dashboard" element={<UserDashboard user={user} />} />
            <Route path="/author" element={<AuthorDashboard user={user} />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/create-story" element={<CreateStory user={user} />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;