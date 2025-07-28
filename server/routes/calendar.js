const express = require('express');
const CalendarEvent = require('../models/CalendarEvent');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/calendar/events - Get calendar events
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const { month, year, department } = req.query;
    
    let query = {};
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    // Filter by department if provided
    if (department) {
      query.department = department;
    }
    
    // Students see public events and events they're attending
    if (req.user.role === 'student') {
      query.$or = [
        { isPublic: true },
        { attendees: req.user._id }
      ];
    }
    
    // Instructors see their own events and public events in their department
    if (req.user.role === 'instructor') {
      query.$or = [
        { instructor: req.user._id },
        { isPublic: true, department: req.user.department }
      ];
    }
    
    // Admins see all events
    if (req.user.role === 'admin') {
      // No additional filtering for admins
    }
    
    const events = await CalendarEvent.find(query)
      .populate('instructor', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ date: 1, time: 1 });
    
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ success: false, message: 'Server error fetching events' });
  }
});

// POST /api/calendar/events - Create new calendar event
router.post('/events', authenticateToken, async (req, res) => {
  try {
    // Only instructors and admins can create events
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only instructors and admins can create events' });
    }
    
    const {
      title,
      description,
      date,
      time,
      courseTitle,
      information,
      instructorName,
      eventType,
      location,
      duration,
      isPublic
    } = req.body;
    
    // Validate required fields
    if (!title || !date || !time || !courseTitle || !instructorName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, date, time, courseTitle, instructorName' 
      });
    }
    
    const newEvent = new CalendarEvent({
      title,
      description,
      date: new Date(date),
      time,
      courseTitle,
      information,
      instructorName,
      instructor: req.user._id,
      department: req.user.department,
      eventType: eventType || 'lecture',
      location,
      duration: duration || 60,
      isPublic: isPublic !== false, // Default to true
      createdBy: req.user._id
    });
    
    await newEvent.save();
    
    // Populate the response
    await newEvent.populate('instructor', 'firstName lastName email');
    await newEvent.populate('createdBy', 'firstName lastName');
    
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ success: false, message: 'Server error creating event' });
  }
});

// PUT /api/calendar/events/:id - Update calendar event
router.put('/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Only the creator or admin can update the event
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }
    
    const updateFields = [
      'title', 'description', 'date', 'time', 'courseTitle', 
      'information', 'instructorName', 'eventType', 'location', 
      'duration', 'isPublic', 'status'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          event[field] = new Date(req.body[field]);
        } else {
          event[field] = req.body[field];
        }
      }
    });
    
    await event.save();
    await event.populate('instructor', 'firstName lastName email');
    await event.populate('createdBy', 'firstName lastName');
    
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ success: false, message: 'Server error updating event' });
  }
});

// DELETE /api/calendar/events/:id - Delete calendar event
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    // Only the creator or admin can delete the event
    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }
    
    await CalendarEvent.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ success: false, message: 'Server error deleting event' });
  }
});

module.exports = router;
