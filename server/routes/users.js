import express from 'express';
import User from '../models/User.js';
import Story from '../models/Story.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('bookmarkedStories', 'title author category stats')
      .populate('readingHistory.story', 'title author category stats');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get stories in progress
    const continueReading = user.readingHistory
      .filter(entry => !entry.completed)
      .sort((a, b) => b.lastRead - a.lastRead)
      .slice(0, 5);

    res.json({
      success: true,
      stats: user.stats,
      bookmarkedStories: user.bookmarkedStories,
      readingHistory: user.readingHistory.slice(0, 10),
      continueReading
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/author/stats
// @desc    Get author statistics and stories
// @access  Private (Author/Admin)
router.get('/author/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'author' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const stories = await Story.find({ author: req.user.userId })
      .sort({ createdAt: -1 });

    const stats = {
      totalStories: stories.length,
      totalReads: stories.reduce((acc, story) => acc + (story.stats.reads || 0), 0),
      totalLikes: stories.reduce((acc, story) => acc + (story.likes.length || 0), 0),
      audioStories: stories.filter(story => story.audio.hasAudio).length
    };

    res.json({
      success: true,
      stats,
      stories
    });
  } catch (error) {
    console.error('Author stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
