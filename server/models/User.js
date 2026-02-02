import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'author', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    storiesRead: {
      type: Number,
      default: 0
    },
    hoursListened: {
      type: Number,
      default: 0
    },
    bookmarks: {
      type: Number,
      default: 0
    }
  },
  bookmarkedStories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  readingHistory: [{
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastRead: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

// Update reading stats
userSchema.methods.updateReadingStats = function(storyId, progress, timeSpent) {
  // Update reading history
  const existingEntry = this.readingHistory.find(entry => 
    entry.story.toString() === storyId.toString()
  );
  
  if (existingEntry) {
    existingEntry.progress = progress;
    existingEntry.lastRead = new Date();
    existingEntry.completed = progress >= 100;
  } else {
    this.readingHistory.push({
      story: storyId,
      progress,
      lastRead: new Date(),
      completed: progress >= 100
    });
  }
  
  // Update stats
  if (progress >= 100) {
    this.stats.storiesRead += 1;
  }
  this.stats.hoursListened += timeSpent / 3600; // Convert seconds to hours
  
  return this.save();
};

export default mongoose.model('User', userSchema);