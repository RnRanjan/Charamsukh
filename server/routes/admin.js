import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Story from '../models/Story.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get platform-wide statistics
// @access  Private (Admin)
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for admin stats');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    console.log('📊 Fetching admin stats...');
    
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAuthors = await User.countDocuments({ role: 'author' });
    const totalStories = await Story.countDocuments();
    const pendingStories = await Story.countDocuments({ status: 'pending' });
    
    // Aggregate other stats
    const stories = await Story.find();
    const totalLikes = stories.reduce((acc, story) => acc + (story.likes.length || 0), 0);
    const audioPlays = stories.reduce((acc, story) => acc + (story.stats.audioPlays || 0), 0);

    console.log('📊 Admin stats fetched:', {
      totalUsers,
      totalAuthors,
      totalStories,
      pendingStories,
      totalLikes,
      audioPlays
    });

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
    console.error('❌ Admin stats error:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for admin users');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    console.log('👥 Fetching all users...');
    const users = await User.find().sort({ createdAt: -1 });
    console.log(`👥 Fetched ${users.length} users`);
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Admin users error:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   GET /api/admin/stories
// @desc    Get all stories for moderation
// @access  Private (Admin)
router.get('/stories', auth, authorize('admin'), async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for admin stories');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    console.log('📚 Fetching all stories for admin...');
    const stories = await Story.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    console.log(`📚 Fetched ${stories.length} stories for admin`);
    
    res.json({ success: true, stories });
  } catch (error) {
    console.error('❌ Admin stories error:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user status (activate/suspend)
// @access  Private (Admin)
router.put('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    // Check database connectivity
    if (mongoose.connection.readyState !== 1) {
      console.log('❌ Database not connected for admin user update');
      return res.status(503).json({
        success: false,
        message: 'Database not connected'
      });
    }
    
    const { isActive } = req.body;
    console.log(`👤 Updating user ${req.params.id} status to ${isActive ? 'active' : 'inactive'}`);
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'isActive must be a boolean value' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    
    if (!user) {
      console.log(`❌ User not found: ${req.params.id}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log(`✅ User ${req.params.id} status updated successfully`);
    
    res.json({ 
      success: true, 
      user,
      message: isActive ? 'User activated' : 'User suspended'
    });
  } catch (error) {
    console.error('❌ Error updating user:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

export default router;
