const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: ['computer-science', 'engineering', 'business', 'mathematics', 'physics', 'chemistry', 'biology']
  },
  courseCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  duration: {
    type: String,
    required: true,
    enum: ['1 semester', '2 semesters', '1 year', '2 years']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  syllabus: {
    type: String,
    trim: true
  },
  objectives: [{
    type: String,
    trim: true
  }],
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    time: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    }
  },
  maxStudents: {
    type: Number,
    default: 30,
    min: 1
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped'],
      default: 'enrolled'
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  coverImage: {
    type: String,
    trim: true
  },
  materials: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignments: [{
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    points: {
      type: Number,
      default: 100
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
courseSchema.index({ department: 1, status: 1 });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ courseCode: 1 });
courseSchema.index({ 'enrolledStudents.student': 1 });

// Virtual for enrolled student count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.filter(enrollment => enrollment.status === 'enrolled').length;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.enrollmentCount;
});

module.exports = mongoose.model('Course', courseSchema);
