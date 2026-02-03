import express from 'express';
import User from '../models/User.js';
import Story from '../models/Story.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get platform-wide statistics
// @access  Private (Admin)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAuthors = await User.countDocuments({ role: 'author' });
    const totalStories = await Story.countDocuments();
    const pendingStories = await Story.countDocuments({ status: 'pending' });
    
    // Aggregate other stats
    const stories = await Story.find();
    const totalLikes = stories.reduce((acc, story) => acc + (story.likes.length || 0), 0);
    const audioPlays = stories.reduce((acc, story) => acc + (story.stats.audioPlays || 0), 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAuthors,
        totalStories,
        pendingStories,
        totalLikes,
        audioPlays
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/admin/stories
// @desc    Get all stories for moderation
// @access  Private (Admin)
router.get('/stories', auth, authorize('admin'), async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user status (activate/suspend)
// @access  Private (Admin)
router.put('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      user,
      message: isActive ? 'User activated' : 'User suspended'
    });
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

export default router;
