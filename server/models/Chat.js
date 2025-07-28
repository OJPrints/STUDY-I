const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'link'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Reply cannot exceed 1000 characters']
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
  }]
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chat title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['department', 'private', 'group'],
    default: 'department'
  },
  department: {
    type: String,
    required: function() { return this.type === 'department'; },
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
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  settings: {
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowReactions: {
      type: Boolean,
      default: true
    },
    allowReplies: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    },
    allowedFileTypes: [{
      type: String,
      default: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif']
    }]
  },
  stats: {
    messageCount: { type: Number, default: 0 },
    participantCount: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
  return this.messages && this.messages.length > 0 
    ? this.messages[this.messages.length - 1] 
    : null;
});

// Virtual for unread count (for a specific user)
chatSchema.virtual('unreadCount').get(function() {
  // This would be calculated per user
  return 0;
});

// Indexes for better query performance
chatSchema.index({ type: 1, department: 1 });
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ createdBy: 1 });
chatSchema.index({ isActive: 1 });
chatSchema.index({ isPublic: 1 });
chatSchema.index({ 'stats.lastActivity': -1 });
chatSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware
chatSchema.pre('save', function(next) {
  // Update participant count
  this.stats.participantCount = this.participants.length;
  
  // Update last activity
  this.stats.lastActivity = new Date();
  
  next();
});

// Method to add participant
chatSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      role,
      joinedAt: new Date(),
      lastSeen: new Date(),
      isActive: true
    });
    this.stats.participantCount = this.participants.length;
  }
  
  return this.save();
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  this.stats.participantCount = this.participants.length;
  return this.save();
};

// Method to update participant last seen
chatSchema.methods.updateLastSeen = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastSeen = new Date();
    this.stats.lastActivity = new Date();
  }
  return this.save();
};

// Method to pin message
chatSchema.methods.pinMessage = function(messageId) {
  if (!this.pinnedMessages.includes(messageId)) {
    this.pinnedMessages.push(messageId);
  }
  return this.save();
};

// Method to unpin message
chatSchema.methods.unpinMessage = function(messageId) {
  this.pinnedMessages = this.pinnedMessages.filter(id => id.toString() !== messageId.toString());
  return this.save();
};

// Static method to find department chats
chatSchema.statics.findByDepartment = function(department) {
  return this.find({ 
    department, 
    type: 'department', 
    isActive: true 
  }).populate('participants.user', 'firstName lastName avatar');
};

// Static method to find user's chats
chatSchema.statics.findByUser = function(userId) {
  return this.find({ 
    'participants.user': userId,
    isActive: true 
  }).populate('participants.user', 'firstName lastName avatar');
};

// Static method to find public chats
chatSchema.statics.findPublic = function() {
  return this.find({ 
    isPublic: true, 
    isActive: true 
  }).populate('participants.user', 'firstName lastName avatar');
};

// Static method to search chats
chatSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }).populate('participants.user', 'firstName lastName avatar');
};

// Message schema methods
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({ user: userId, emoji });
  
  return this.save();
};

messageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

messageSchema.methods.edit = function(newContent) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  return this.save();
};

messageSchema.methods.delete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

messageSchema.methods.addReply = function(userId, content) {
  this.replies.push({
    sender: userId,
    content,
    createdAt: new Date()
  });
  return this.save();
};

// Create the Message model
const Message = mongoose.model('Message', messageSchema);

// Add messages to chat schema
chatSchema.add({
  messages: [messageSchema]
});

module.exports = mongoose.model('Chat', chatSchema);
module.exports.Message = Message; 