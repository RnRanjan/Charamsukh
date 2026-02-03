import { useState, useEffect } from 'react';
import { API } from '../config';

const AdminCategories = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'fa-book', color: 'bg-primary-600' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', icon: '', color: '' });
  const [submitting, setSubmitting] = useState(false);

  const iconOptions = ['fa-book', 'fa-heart', 'fa-star', 'fa-lightbulb', 'fa-leaf', 'fa-fire', 'fa-music', 'fa-pen'];
  const colorOptions = ['bg-primary-600', 'bg-rose-600', 'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(API.categories);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        console.error('Failed to fetch categories:', data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newCategory.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    setSubmitting(true);
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };
      const res = await fetch(API.categories, {
        method: 'POST',
        headers,
        body: JSON.stringify(newCategory)
      });
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.category]);
        setNewCategory({ name: '', icon: 'fa-book', color: 'bg-primary-600' });
        alert('Category added successfully!');
      } else {
        console.error('Failed to add category:', data.message);
        alert(`Error: ${data.message || 'Failed to add category'}`);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Error adding category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async () => {
    // Basic validation
    if (!editData.name.trim()) {
      alert('Category name is required');
      return;
    }
    
    setSubmitting(true);
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      };
      const res = await fetch(`${API.categories}/${editingId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(editData)
      });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === editingId ? { ...c, ...editData } : c));
        setEditingId(null);
        setEditData({ name: '', icon: '', color: '' });
        alert('Category updated successfully!');
      } else {
        console.error('Failed to update category:', data.message);
        alert(`Error: ${data.message || 'Failed to update category'}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const res = await fetch(`${API.categories}/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter(c => c._id !== id));
        alert('Category deleted successfully!');
      } else {
        console.error('Failed to delete category:', data.message);
        alert(`Error: ${data.message || 'Failed to delete category'}`);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Manage Categories</h2>

      {/* Add New Category Form */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add New Category</h3>
        <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Category name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            required
          />
          <select
            value={newCategory.icon}
            onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {iconOptions.map(icon => (
              <option key={icon} value={icon}><i className={`fas ${icon}`}></i> {icon}</option>
            ))}
          </select>
          <select
            value={newCategory.color}
            onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {colorOptions.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Adding...
              </>
            ) : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Edit Category Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Category</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <select
                value={editData.icon}
                onChange={(e) => setEditData({ ...editData, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <select
                value={editData.color}
                onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {colorOptions.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateCategory}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
                    </>
                  ) : 'Update'}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat._id} className={`${cat.color} text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
              <i className={`fas ${cat.icon} text-4xl opacity-80`}></i>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(cat._id);
                    setEditData({ name: cat.name, icon: cat.icon, color: cat.color });
                  }}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  title="Edit"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat._id)}
                  className="p-2 bg-white/20 hover:bg-red-500/50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold">{cat.name}</h3>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          No categories yet. Create one above!
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
