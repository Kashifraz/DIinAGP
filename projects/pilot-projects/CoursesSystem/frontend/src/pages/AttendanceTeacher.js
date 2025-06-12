import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Alert, CircularProgress, Divider, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getCourses } from '../api/courses';
import { getTimetablesByCourse } from '../api/timetables';
import { createSession, getSessionRecords } from '../api/attendance';
import { QRCodeCanvas } from 'qrcode.react';

const AttendanceTeacher = () => {
  const [courses, setCourses] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(10);
  const [qrCode, setQrCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [records, setRecords] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCourses();
        setCourses(res.data);
      } catch {
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      getTimetablesByCourse(selectedCourse).then(res => setTimetables(res.data));
    } else {
      setTimetables([]);
    }
  }, [selectedCourse]);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setQrCode('');
    setSessionId('');
    try {
      const res = await createSession({
        course: selectedCourse,
        timetable: selectedTimetable,
        date,
        startTime,
        endTime,
        durationMinutes: duration
      });
      setQrCode(res.data.qrCode);
      setSessionId(res.data._id);
      setSuccess('QR code generated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR code');
    }
    setLoading(false);
  };

  const handleViewRecords = async () => {
    setFetchingRecords(true);
    setRecords([]);
    try {
      const res = await getSessionRecords(sessionId);
      setRecords(res.data);
      setOpenDialog(true);
    } catch {
      setRecords([]);
    }
    setFetchingRecords(false);
  };

  return (
    <Box
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
        py: 4,
        px: { xs: 1, sm: 2, md: 4 },
        fontFamily: 'Roboto, Arial, sans-serif',
      }}
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" mb={2}>
        <QrCodeScannerIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700} letterSpacing={1}>
          Generate Attendance QR Code
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, boxShadow: 6, maxWidth: 520, width: '100%', mb: 3 }}>
        <Box component="form" display="flex" flexDirection="column" gap={2}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />Session Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TextField select label="Course" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required variant="outlined">
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </TextField>
          <TextField select label="Timetable" value={selectedTimetable} onChange={e => setSelectedTimetable(e.target.value)} required variant="outlined">
            <option value="">Select Timetable</option>
            {timetables.map(tt => <option key={tt._id} value={tt._id}>{tt.dayOfWeek} {tt.startTime}-{tt.endTime} ({tt.classroom})</option>)}
          </TextField>
          <TextField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required variant="outlined" InputLabelProps={{ shrink: true }} />
          <TextField label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required variant="outlined" InputLabelProps={{ shrink: true }} />
          <TextField label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required variant="outlined" InputLabelProps={{ shrink: true }} />
          <TextField label="QR Duration (minutes)" type="number" value={duration} onChange={e => setDuration(e.target.value)} required variant="outlined" />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleGenerate} disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Generate QR Code'}
          </Button>
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Box>
      </Paper>
      {qrCode && (
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, boxShadow: 6, maxWidth: 420, width: '100%', mb: 3, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Scan this QR Code</Typography>
          <QRCodeCanvas value={qrCode} size={200} style={{ margin: '0 auto' }} />
          <Box mt={2}>
            <Button variant="outlined" color="primary" onClick={handleViewRecords} disabled={fetchingRecords}>
              {fetchingRecords ? <CircularProgress size={20} /> : 'View Attendance Records'}
            </Button>
          </Box>
        </Paper>
      )}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Attendance Records</DialogTitle>
        <DialogContent>
          {records.length === 0 ? (
            <Typography>No attendance records found.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map(r => (
                    <TableRow key={r.student._id}>
                      <TableCell>{r.student.name}</TableCell>
                      <TableCell>{r.student.email}</TableCell>
                      <TableCell>
                        {r.status === 'present' ? (
                          <Tooltip title="Present"><CheckCircleIcon color="success" /></Tooltip>
                        ) : (
                          <Tooltip title="Absent"><CancelIcon color="error" /></Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceTeacher; 