import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Redirect based on role
      if (data.user.role === 'author') {
        navigate('/author');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 selection:bg-accent-500/30">
      <div className="max-w-md w-full space-y-8 relative">
        {/* Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div>
            <div className="flex justify-center">
              <i className="fas fa-user-plus text-4xl text-accent-500"></i>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              Or{' '}
              <Link to="/login" className="font-medium text-accent-500 hover:text-accent-400 transition-colors">
                sign in to existing account
              </Link>
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-slate-300">
                  <i className="fas fa-user mr-2 text-primary-400"></i>Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-300">
                  <i className="fas fa-envelope mr-2 text-primary-400"></i>Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-300">
                  <i className="fas fa-lock mr-2 text-primary-400"></i>Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-slate-300">
                  <i className="fas fa-lock mr-2 text-primary-400"></i>Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium mb-2 text-slate-300">
                  <i className="fas fa-users mr-2 text-primary-400"></i>Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user" className="bg-slate-900">Reader - Read and listen to stories</option>
                  <option value="author" className="bg-slate-900">Author - Write and publish stories</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-user-plus mr-2"></i>
                )}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-xs text-slate-500 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-accent-500 hover:text-accent-400 transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-accent-500 hover:text-accent-400 transition-colors">Privacy Policy</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
