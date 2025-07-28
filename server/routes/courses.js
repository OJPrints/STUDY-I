const express = require('express');
const Course = require('../models/Course');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/courses - Get all active courses
router.get('/', async (req, res) => {
  try {
    const { department, level, instructor } = req.query;
    
    let query = { status: 'active', isPublic: true };
    
    // Filter by department if provided
    if (department) {
      query.department = department;
    }
    
    // Filter by level if provided
    if (level) {
      query.level = level;
    }
    
    // Filter by instructor if provided
    if (instructor) {
      query.instructor = instructor;
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching courses' });
  }
});

// GET /api/courses/my - Get instructor's courses
router.get('/my', authenticateToken, async (req, res) => {
  try {
    // Only instructors and admins can view their courses
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const courses = await Course.find({ instructor: req.user._id })
      .populate('instructor', 'firstName lastName email')
      .populate('enrolledStudents.student', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching courses' });
  }
});

// GET /api/courses/enrolled - Get student's enrolled courses
router.get('/enrolled', authenticateToken, async (req, res) => {
  try {
    // Only students can view their enrolled courses
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const courses = await Course.find({ 
      'enrolledStudents.student': req.user._id,
      'enrolledStudents.status': 'enrolled'
    })
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching enrolled courses' });
  }
});

// POST /api/courses - Create new course
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Only instructors and admins can create courses
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only instructors and admins can create courses' });
    }
    
    const {
      title,
      description,
      courseCode,
      credits,
      duration,
      level,
      prerequisites,
      syllabus,
      objectives,
      schedule,
      maxStudents,
      startDate,
      endDate,
      coverImage,
      tags
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !courseCode || !credits || !duration || !level || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, description, courseCode, credits, duration, level, startDate, endDate' 
      });
    }
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    
    const newCourse = new Course({
      title,
      description,
      instructor: req.user._id,
      instructorName: `${req.user.firstName} ${req.user.lastName}`,
      department: req.user.department,
      courseCode: courseCode.toUpperCase(),
      credits: parseInt(credits),
      duration,
      level,
      prerequisites: prerequisites || [],
      syllabus,
      objectives: objectives || [],
      schedule: schedule || {},
      maxStudents: maxStudents || 30,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      coverImage,
      tags: tags || []
    });
    
    await newCourse.save();
    
    // Populate the response
    await newCourse.populate('instructor', 'firstName lastName email');
    
    res.status(201).json({ success: true, course: newCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    
    // Handle duplicate course code error
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    
    res.status(500).json({ success: false, message: 'Server error creating course' });
  }
});

// PUT /api/courses/:id - Update course
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Only the instructor or admin can update the course
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }
    
    const updateFields = [
      'title', 'description', 'credits', 'duration', 'level', 
      'prerequisites', 'syllabus', 'objectives', 'schedule', 
      'maxStudents', 'startDate', 'endDate', 'coverImage', 
      'tags', 'status'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          course[field] = new Date(req.body[field]);
        } else if (field === 'credits' || field === 'maxStudents') {
          course[field] = parseInt(req.body[field]);
        } else {
          course[field] = req.body[field];
        }
      }
    });
    
    await course.save();
    await course.populate('instructor', 'firstName lastName email');
    
    res.json({ success: true, course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Server error updating course' });
  }
});

// POST /api/courses/:id/enroll - Enroll student in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if course is active
    if (course.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Course is not available for enrollment' });
    }
    
    // Check if student is already enrolled
    const existingEnrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === req.user._id.toString() && enrollment.status === 'enrolled'
    );
    
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }
    
    // Check if course is full
    if (course.enrollmentCount >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'Course is full' });
    }
    
    // Enroll the student
    course.enrolledStudents.push({
      student: req.user._id,
      enrolledAt: new Date(),
      status: 'enrolled'
    });
    
    await course.save();
    
    res.json({ success: true, message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ success: false, message: 'Server error enrolling in course' });
  }
});

// DELETE /api/courses/:id - Delete course
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Only the instructor or admin can delete the course
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Server error deleting course' });
  }
});

module.exports = router;
