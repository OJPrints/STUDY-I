const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'computer-science',
      'engineering',
      'business',
      'arts',
      'science',
      'medicine',
      'law',
      'education'
    ]
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'research-paper',
      'tutorial',
      'case-study',
      'review',
      'news',
      'announcement',
      'other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  coverUrl: {
    type: String,
    required: false // Cover image is optional
  },
  fileName: {
    type: String,
    required: [true, 'File name is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['pdf', 'doc', 'docx', 'txt', 'html']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  stats: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 }
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters']
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
    content: {
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
    },
    editedAt: Date
  }],
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  seo: {
    keywords: [String],
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating
articleSchema.virtual('averageRating').get(function() {
  if (this.stats.ratingCount === 0) return 0;
  return (this.stats.rating / this.stats.ratingCount).toFixed(1);
});

// Virtual for reading time (estimated)
articleSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Virtual for formatted file size
articleSchema.virtual('formattedFileSize').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Indexes for better query performance
articleSchema.index({ title: 'text', description: 'text', content: 'text' });
articleSchema.index({ author: 1 });
articleSchema.index({ department: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ isPublic: 1 });
articleSchema.index({ isFeatured: 1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ 'stats.views': -1 });
articleSchema.index({ 'stats.rating': -1 });

// Pre-save middleware
articleSchema.pre('save', function(next) {
  // Auto-generate meta description if not provided
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.description.substring(0, 160);
  }
  
  // Auto-generate keywords from title and tags if not provided
  if (!this.seo.keywords || this.seo.keywords.length === 0) {
    const titleKeywords = this.title.toLowerCase().split(' ').filter(word => word.length > 3);
    const tagKeywords = this.tags || [];
    this.seo.keywords = [...new Set([...titleKeywords, ...tagKeywords])];
  }
  
  next();
});

// Method to increment view count
articleSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Method to increment download count
articleSchema.methods.incrementDownloads = function() {
  this.stats.downloads += 1;
  return this.save();
};

// Method to add rating
articleSchema.methods.addRating = function(userId, rating, comment = '') {
  // Remove existing rating from this user
  this.ratings = this.ratings.filter(r => r.user.toString() !== userId.toString());
  
  // Add new rating
  this.ratings.push({ user: userId, rating, comment });
  
  // Update stats
  this.stats.rating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.stats.ratingCount = this.ratings.length;
  
  return this.save();
};

// Method to approve article
articleSchema.methods.approve = function(adminId) {
  this.status = 'approved';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = undefined;
  return this.save();
};

// Method to reject article
articleSchema.methods.reject = function(adminId, reason) {
  this.status = 'rejected';
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

// Static method to find published articles
articleSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'approved', 
    isPublic: true 
  }).populate('author', 'firstName lastName avatar');
};

// Static method to find articles by department
articleSchema.statics.findByDepartment = function(department) {
  return this.find({ 
    department, 
    status: 'approved', 
    isPublic: true 
  }).populate('author', 'firstName lastName avatar');
};

// Static method to find featured articles
articleSchema.statics.findFeatured = function() {
  return this.find({ 
    isFeatured: true, 
    status: 'approved', 
    isPublic: true 
  }).populate('author', 'firstName lastName avatar');
};

// Static method to search articles
articleSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'approved',
    isPublic: true
  }).populate('author', 'firstName lastName avatar');
};

// Static method to get pending articles for admin
articleSchema.statics.findPending = function() {
  return this.find({ status: 'pending' })
    .populate('author', 'firstName lastName email department')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Article', articleSchema); 