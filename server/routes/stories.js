import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { auth, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Multer configuration for file uploads
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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|mp3|wav|ogg|m4a/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and audio files are allowed'));
  }
}).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }
]);

// Error-safe wrapper for multer
const handleFileUpload = (req, res, next) => {
  console.log('🔄 Processing file upload...');
  console.log('Request headers:', req.headers);
  console.log('Content type:', req.headers['content-type']);
  
  upload(req, res, (err) => {
    if (err) {
      console.warn('⚠️ File upload warning:', err.message);
      console.warn('Error details:', err);
      // Don't fail on upload errors, just skip files
      req.files = req.files || {};
      console.log('Files available after error:', Object.keys(req.files || {}));
    } else {
      console.log('✅ File upload completed successfully');
      console.log('Files received:', req.files ? Object.keys(req.files) : 'none');
      if (req.files) {
        Object.keys(req.files).forEach(field => {
          console.log(`File field ${field}:`, req.files[field][0].originalname);
        });
      }
    }
    next();
  });
};

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
router.post('/', 
  auth, 
  handleFileUpload,
  [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content').isLength({ min: 100 }).withMessage('Story must be at least 100 characters long'),
    body('category').notEmpty().withMessage('Category is required')
  ], 
  async (req, res) => {
    try {
      console.log('📝 [CREATE STORY] Request received');
      console.log('User:', req.user);
      console.log('Body keys:', Object.keys(req.body));
      console.log('Files:', req.files ? Object.keys(req.files) : 'none');
      console.log('Body content length:', req.body.content?.length);
      console.log('Body title:', req.body.title);
      console.log('Body category:', req.body.category);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { title, content, category, tags = [], generateAudio = false, description = '' } = req.body;
      
      console.log('📋 Received data:', { title, category, contentLength: content?.length, description, tags: typeof tags });
      console.log('📋 User object:', req.user);
      
      // Validate required fields
      if (!title || !content || !category) {
        console.log('❌ Missing required fields');
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: title, content, category' 
        });
      }

      // Validate content length
      if (content.length < 100) {
        console.log('❌ Content too short:', content.length);
        return res.status(400).json({
          success: false,
          message: `Content must be at least 100 characters long. Current length: ${content.length}`
        });
      }

      console.log('✅ All validations passed');

      if (!req.user || !req.user.userId) {
        console.log('❌ User not authenticated', { hasUser: !!req.user, hasUserId: !!(req.user && req.user.userId) });
        return res.status(401).json({ 
          success: false, 
          message: 'User not authenticated' 
        });
      }
      
      // Verify user exists in database
      if (mongoose.connection.readyState !== 1) {
        console.log('❌ Database not connected');
        return res.status(503).json({
          success: false,
          message: 'Database not connected'
        });
      }
      
      try {
        const user = await User.findById(req.user.userId);
        if (!user) {
          console.log('❌ User not found in database:', req.user.userId);
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }
        console.log('✅ User verified:', user.name, user._id);
      } catch (userError) {
        console.error('❌ Error verifying user:', userError.message);
        return res.status(500).json({
          success: false,
          message: 'Error verifying user account'
        });
      }
      
      // Handle file paths properly
      let coverImage = '';
      let audioFile = '';
      
      if (req.files && req.files.coverImage) {
        coverImage = `/uploads/${req.files.coverImage[0].filename}`;
        console.log('📁 Cover image path:', coverImage);
      }
      
      if (req.files && req.files.audioFile) {
        audioFile = `/uploads/${req.files.audioFile[0].filename}`;
        console.log('📁 Audio file path:', audioFile);
      }

      console.log('📂 Files to attach:', { coverImage, audioFile });

      // Process tags properly - handle both string and JSON string formats
      let processedTags = [];
      if (typeof tags === 'string') {
        try {
          // First, try to parse as JSON (in case it's a JSON string from frontend)
          const parsedTags = JSON.parse(tags);
          if (Array.isArray(parsedTags)) {
            processedTags = parsedTags.map(t => t.trim()).filter(t => t);
          } else {
            // If not an array, treat as comma-separated string
            processedTags = tags.split(',').map(t => t.trim()).filter(t => t);
          }
        } catch (e) {
          // If JSON parsing fails, treat as comma-separated string
          processedTags = tags.split(',').map(t => t.trim()).filter(t => t);
        }
      } else if (Array.isArray(tags)) {
        processedTags = tags.map(t => t.trim()).filter(t => t);
      }
      
      console.log('🏷️ Processed tags:', processedTags);
      
      const story = new Story({
        title,
        description,
        content,
        category,
        tags: processedTags,
        author: req.user.userId,
        coverImage,
        status: 'published',
        audio: {
          hasAudio: !!audioFile,
          audioUrl: audioFile,
          audioStatus: audioFile ? 'generated' : (generateAudio === 'true' || generateAudio === true ? 'generating' : 'none')
        }
      });

      console.log('💾 Saving story to database...');
      console.log('Story object to save:', {
        title: story.title,
        author: story.author,
        authorType: typeof story.author,
        category: story.category,
        contentLength: story.content.length,
        hasCoverImage: !!story.coverImage,
        tags: story.tags
      });
      
      const savedStory = await story.save();
      console.log('✅ Story saved successfully:', savedStory._id);

      res.status(201).json({
        success: true,
        message: 'Story created successfully',
        story: savedStory
      });
    } catch (error) {
      console.error('❌ Create story error:', error.message);
      console.error('Error type:', error.name);
      console.error('Error stack:', error.stack);
      if (error.errors) {
        console.error('Validation errors:', error.errors);
      }
      
      // Return more specific error messages
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(e => e.message);
        return res.status(400).json({ 
          success: false, 
          message: 'Validation error: ' + messages.join(', '),
          error: error.message
        });
      }
      
      if (error.name === 'MongoError' || error.name === 'BulkWriteError') {
        return res.status(500).json({ 
          success: false, 
          message: 'Database error: ' + error.message,
          error: error.message
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Server error during story creation',
        error: {
          message: error.message,
          name: error.name,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        }
      });
    }
  }
);

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
