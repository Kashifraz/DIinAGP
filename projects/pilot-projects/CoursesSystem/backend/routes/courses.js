const express = require('express');
const Course = require('../models/Course');
const { auth, requireRole } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

const router = express.Router();

// Create a course (teacher/admin)
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { code, name, creditHours, description } = req.body;
    const teacher = req.user.userId;
    const course = new Course({ code, name, creditHours, description, teacher });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// List all courses
router.get('/', auth, async (req, res) => {
  const courses = await Course.find().populate('teacher', '_id name email');
  res.json(courses);
});

// Get course details
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', '_id name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: 'Invalid course ID' });
  }
});

// Update course (teacher/admin)
router.put('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete course (teacher/admin)
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid course ID' });
  }
});

// Enroll a student by email (teacher/admin)
router.post('/:id/enroll', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { email } = req.body;
    const student = await User.findOne({ email, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await Enrollment.create({ course: req.params.id, student: student._id });
    res.json({ message: 'Student enrolled' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }
    res.status(400).json({ message: error.message });
  }
});

// List enrolled students for a course
router.get('/:id/students', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.id }).populate('student', 'name email');
    res.json(enrollments.map(e => e.student));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a student from a course
router.delete('/:id/enroll/:studentId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    await Enrollment.deleteOne({ course: req.params.id, student: req.params.studentId });
    res.json({ message: 'Student removed from course' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 