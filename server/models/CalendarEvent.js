const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String,
    required: true,
    trim: true
  },
  information: {
    type: String,
    trim: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true,
    enum: ['computer-science', 'engineering', 'business', 'mathematics', 'physics', 'chemistry', 'biology']
  },
  eventType: {
    type: String,
    enum: ['lecture', 'exam', 'assignment', 'meeting', 'workshop', 'seminar'],
    default: 'lecture'
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  location: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
calendarEventSchema.index({ date: 1, department: 1 });
calendarEventSchema.index({ instructor: 1, date: 1 });
calendarEventSchema.index({ attendees: 1, date: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
