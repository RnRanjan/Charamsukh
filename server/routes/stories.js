import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { auth, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for cover image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Increase to 50MB for audio
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|mp3|wav|ogg|m4a/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and audio files are allowed'));
  }
});

const storyUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }
]);

// @route   GET /api/stories
// @desc    Get all published stories with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, searchTerm, hasAudio, sort = 'publishedAt' } = req.query;
    
    const query = { status: 'published' };
    
    if (category) query.category = category;
    if (hasAudio === 'true') query['audio.hasAudio'] = true;
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    const stories = await Story.find(query)
      .populate('author', 'name avatar')
      .sort({ [sort]: -1 })
      .select('-content');

    res.json({
      success: true,
      count: stories.length,
      stories
    });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stories' });
  }
});

// @route   GET /api/stories/featured
// @desc    Get featured stories for landing page
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const stories = await Story.find({ status: 'published', featured: true })
      .populate('author', 'name avatar')
      .limit(6)
      .select('-content');
    
    // If no featured stories, just get the latest 6
    if (stories.length === 0) {
      const latest = await Story.find({ status: 'published' })
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1 })
        .limit(6)
        .select('-content');
      return res.json({ success: true, stories: latest });
    }

    res.json({ success: true, stories });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/stories/:id
// @desc    Get story by ID
// @access  Public (Optional Auth for likes/bookmarks)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('author', 'name avatar bio')
      .populate('comments.user', 'name avatar');

    if (!story) {
      return res.status(404).json({ success: false, message: 'Story not found' });
    }

    // Increment views
    await story.incrementViews();

    res.json({
      success: true,
      story
    });
  } catch (error) {
    console.error('Get story error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/stories
// @desc    Create a new story
// @access  Private (Any authenticated user)
router.post('/', auth, storyUpload, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').isLength({ min: 100 }).withMessage('Story must be at least 100 characters long'),
  body('category').notEmpty().withMessage('Category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, category, tags = [], generateAudio = false, description = '' } = req.body;
    
    const coverImage = req.files && req.files.coverImage ? `/uploads/${req.files.coverImage[0].filename}` : '';
    const audioFile = req.files && req.files.audioFile ? `/uploads/${req.files.audioFile[0].filename}` : '';

    const story = new Story({
      title,
      description,
      content,
      category,
      tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags,
      author: req.user.userId,
      coverImage,
      status: 'published',
      audio: {
        hasAudio: !!audioFile,
        audioUrl: audioFile,
        audioStatus: audioFile ? 'generated' : (generateAudio === 'true' || generateAudio === true ? 'generating' : 'none')
      }
    });

    await story.save();

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story
    });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ success: false, message: 'Server error during story creation' });
  }
});

// @route   POST /api/stories/:id/like
// @desc    Like/Unlike a story
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    const existingLike = story.likes.find(l => l.user.toString() === req.user.userId);
    
    if (existingLike) {
      await story.removeLike(req.user.userId);
      res.json({ success: true, liked: false, count: story.likes.length });
    } else {
      await story.addLike(req.user.userId);
      res.json({ success: true, liked: true, count: story.likes.length });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/stories/:id/comment
// @desc    Add a comment to a story
// @access  Private
router.post('/:id/comment', auth, [
  body('comment').trim().notEmpty().withMessage('Comment cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    await story.addComment(req.user.userId, req.body.comment);
    
    const updatedStory = await Story.findById(req.params.id).populate('comments.user', 'name avatar');

    res.json({
      success: true,
      message: 'Comment added',
      comments: updatedStory.comments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/stories/:id
// @desc    Delete a story
// @access  Private (Author/Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    // Check ownership
    if (story.author.toString() !== req.user.userId && req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Story.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Story deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/stories/:id/generate-audio
// @desc    Simulate/Trigger audio generation
// @access  Private (Author/Admin)
router.post('/:id/generate-audio', auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    // Mock audio generation trigger
    story.audio.audioStatus = 'generating';
    await story.save();

    // Simulate completion after 10 seconds
    setTimeout(async () => {
      try {
        const s = await Story.findById(req.params.id);
        if (s) {
          s.audio.audioStatus = 'generated';
          s.audio.hasAudio = true;
          s.audio.audioUrl = '/api/placeholder/audio.mp3';
          await s.save();
        }
      } catch (err) {
        console.error('Background audio generation error:', err);
      }
    }, 10000);

    res.json({ success: true, message: 'Audio generation started' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/stories/:id/moderate
// @desc    Moderate story (Update status and category)
// @access  Private (Admin)
router.put('/:id/moderate', auth, authorize('admin'), [
  body('status').optional().isIn(['published', 'rejected', 'pending']).withMessage('Invalid status'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    if (req.body.status) {
      story.status = req.body.status;
      if (req.body.status === 'published' && !story.publishedAt) {
        story.publishedAt = new Date();
      }
    }

    if (req.body.category) {
      story.category = req.body.category;
    }
    
    await story.save();
    res.json({ success: true, message: 'Story moderated successfully', story });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
