// API Configuration
export const API_BASE_URL = 
  process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-api.com' // Replace with your deployed backend URL
    : 'http://localhost:5000';

export const API = {
  categories: `${API_BASE_URL}/api/categories`,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    me: `${API_BASE_URL}/api/auth/me`,
  },
  stories: {
    list: `${API_BASE_URL}/api/stories`,
    featured: `${API_BASE_URL}/api/stories/featured`,
    detail: (id) => `${API_BASE_URL}/api/stories/${id}`,
  },
  users: {
    dashboard: `${API_BASE_URL}/api/users/dashboard`,
    authorStats: `${API_BASE_URL}/api/users/author/stats`,
  },
  admin: {
    stats: `${API_BASE_URL}/api/admin/stats`,
    users: `${API_BASE_URL}/api/admin/users`,
    stories: `${API_BASE_URL}/api/admin/stories`,
    categories: {
      create: `${API_BASE_URL}/api/categories`,
      delete: (id) => `${API_BASE_URL}/api/categories/${id}`,
    },
  },
};
