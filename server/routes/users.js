const express = require('express');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/students - Get students for instructor/admin
router.get('/students', authenticateToken, async (req, res) => {
  try {
    // Only instructors and admins can view students
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query = { role: 'student' };

    // Instructors see students in their department
    if (req.user.role === 'instructor') {
      query.department = req.user.department;
    }

    const students = await User.find(query)
      .select('firstName lastName email department phone createdAt lastActive')
      .sort({ lastName: 1, firstName: 1 });

    // Get enrollment information for each student
    const studentsWithEnrollments = await Promise.all(
      students.map(async (student) => {
        const enrollments = await Enrollment.find({
          student: student._id,
          ...(req.user.role === 'instructor' ? { instructor: req.user._id } : {})
        })
        .populate('instructor', 'firstName lastName')
        .select('course status progress enrollmentDate');

        return {
          ...student.toObject(),
          enrollments,
          enrolledCourses: enrollments.map(e => e.course),
          status: enrollments.length > 0 ? 'enrolled' : 'not-enrolled'
        };
      })
    );

    res.json({ success: true, students: studentsWithEnrollments });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
});

// POST /api/users/enroll - Enroll student in course
router.post('/enroll', authenticateToken, async (req, res) => {
  try {
    // Only instructors and admins can enroll students
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { studentId, course } = req.body;

    if (!studentId || !course) {
      return res.status(400).json({ success: false, message: 'Student ID and course are required' });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      instructor: req.user._id,
      course: course
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Student already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: studentId,
      instructor: req.user._id,
      course: course,
      department: req.user.department
    });

    await enrollment.save();
    await enrollment.populate('student', 'firstName lastName email');

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    console.error('Error enrolling student:', error);
    res.status(500).json({ success: false, message: 'Server error enrolling student' });
  }
});

// DELETE /api/users/enroll/:enrollmentId - Remove student enrollment
router.delete('/enroll/:enrollmentId', authenticateToken, async (req, res) => {
  try {
    // Only instructors and admins can remove enrollments
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const enrollment = await Enrollment.findById(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Instructors can only remove their own enrollments
    if (req.user.role === 'instructor' && enrollment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this enrollment' });
    }

    await Enrollment.findByIdAndDelete(req.params.enrollmentId);

    res.json({ success: true, message: 'Student removed from course successfully' });
  } catch (error) {
    console.error('Error removing enrollment:', error);
    res.status(500).json({ success: false, message: 'Server error removing enrollment' });
  }
});

// GET /api/users/profile - Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add enrollment information for students
    if (user.role === 'student') {
      const enrollments = await Enrollment.find({ student: user._id })
        .populate('instructor', 'firstName lastName email')
        .select('course status progress enrollmentDate');

      user.enrollments = enrollments;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

module.exports = router;