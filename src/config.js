// API Configuration - Updated 2026-02-03
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_BASE_URL = isDevelopment
  ? 'http://localhost:5000'
  : 'https://charamsukh-api.onrender.com';

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
