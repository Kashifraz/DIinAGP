const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  dayOfWeek: { type: String, required: true }, // e.g., Monday
  startTime: { type: String, required: true }, // e.g., 09:00
  endTime: { type: String, required: true },   // e.g., 10:30
  classroom: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema); 