const express = require('express');
const Timetable = require('../models/Timetable');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create a timetable entry (teacher/admin)
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { course, dayOfWeek, startTime, endTime, classroom } = req.body;
    const timetable = new Timetable({ course, dayOfWeek, startTime, endTime, classroom });
    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// List timetables (optionally filter by course)
router.get('/', auth, async (req, res) => {
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  const timetables = await Timetable.find(filter).populate('course');
  res.json(timetables);
});

// Update timetable entry (teacher/admin)
router.put('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    res.json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete timetable entry (teacher/admin)
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    res.json({ message: 'Timetable deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid timetable ID' });
  }
});

// Get all timetables for a specific course
router.get('/by-course/:courseId', async (req, res) => {
  try {
    const timetables = await Timetable.find({ course: req.params.courseId });
    res.json(timetables);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 