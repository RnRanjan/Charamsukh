import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [100, 'Story must be at least 100 characters long']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  coverImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'pending', 'rejected'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  audio: {
    hasAudio: {
      type: Boolean,
      default: false
    },
    audioUrl: {
      type: String,
      default: ''
    },
    audioStatus: {
      type: String,
      enum: ['none', 'generating', 'generated', 'failed'],
      default: 'none'
    },
    duration: {
      type: Number, // in seconds
      default: 0
    },
    voice: {
      type: String,
      default: 'default'
    }
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    reads: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    bookmarks: {
      type: Number,
      default: 0
    },
    audioPlays: {
      type: Number,
      default: 0
    }
  },
  readTime: {
    type: Number, // in minutes
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  moderationNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate read time and description before saving
storySchema.pre('save', function(next) {
  if (this.isModified('content') && this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
    
    // Auto-generate description if empty
    if (!this.description && this.content.length > 0) {
      this.description = this.content.substring(0, 160).trim() + '...';
    }
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  this.lastModified = new Date();
  next();
});

// Index for search functionality
storySchema.index({ 
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});

// Index for filtering and sorting
storySchema.index({ category: 1, status: 1, publishedAt: -1 });
storySchema.index({ author: 1, status: 1 });
storySchema.index({ 'stats.likes': -1, publishedAt: -1 });
storySchema.index({ 'stats.views': -1, publishedAt: -1 });

// Virtual for like count
storySchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
storySchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Method to add like
storySchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    this.stats.likes = this.likes.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
storySchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => 
    like.user.toString() !== userId.toString()
  );
  this.stats.likes = this.likes.length;
  return this.save();
};

// Method to add comment
storySchema.methods.addComment = function(userId, commentText) {
  this.comments.push({
    user: userId,
    comment: commentText
  });
  this.stats.comments = this.comments.length;
  return this.save();
};

// Method to increment view count
storySchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Method to increment read count
storySchema.methods.incrementReads = function() {
  this.stats.reads += 1;
  return this.save();
};

// Method to increment audio plays
storySchema.methods.incrementAudioPlays = function() {
  this.stats.audioPlays += 1;
  return this.save();
};

// Static method to get popular stories
storySchema.statics.getPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'stats.likes': -1, 'stats.views': -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .select('-content');
};

// Static method to get latest stories
storySchema.statics.getLatest = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .select('-content');
};

// Static method to get stories by category
storySchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ status: 'published', category })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('author', 'name avatar')
    .select('-content');
};

export default mongoose.model('Story', storySchema);