const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  timetable: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  qrCode: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema); 