import React, { useEffect, useState } from 'react';
import { getUser } from '../utils/auth';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Divider, Tooltip, Fab, Skeleton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TimelineIcon from '@mui/icons-material/Timeline';
import CloseIcon from '@mui/icons-material/Close';
import { getTimetables, createTimetable, updateTimetable, deleteTimetable } from '../api/timetables';
import { getCourses } from '../api/courses';

const emptyForm = { course: '', dayOfWeek: '', startTime: '', endTime: '', classroom: '' };
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimetableList = () => {
  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const isTeacherOrAdmin = user && (user.role === 'teacher' || user.role === 'admin');

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const [ttRes, cRes] = await Promise.all([getTimetables(), getCourses()]);
      setTimetables(ttRes.data);
      setCourses(cRes.data);
    } catch {
      setError('Failed to fetch timetables');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTimetables(); }, []);

  const handleOpen = (tt = emptyForm) => {
    setForm(tt);
    setEditingId(tt._id || null);
    setOpen(true);
    setError('');
    setSuccess('');
  };
  const handleClose = () => { setOpen(false); setForm(emptyForm); setEditingId(null); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTimetable(editingId, form);
        setSuccess('Timetable updated');
      } else {
        await createTimetable(form);
        setSuccess('Timetable created');
      }
      handleClose();
      fetchTimetables();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving timetable');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this timetable?')) return;
    try {
      await deleteTimetable(id);
      fetchTimetables();
    } catch {
      setError('Error deleting timetable');
    }
  };

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <TimelineIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700} letterSpacing={1}>
          Timetables
        </Typography>
        {isTeacherOrAdmin && (
          <Tooltip title="Add Timetable">
            <Fab color="primary" size="medium" sx={{ ml: 2 }} onClick={() => handleOpen()}>
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
      </Box>
      <Divider sx={{ mb: 3 }} />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper elevation={4} sx={{ borderRadius: 3, boxShadow: 6, p: 2, mb: 4 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light', position: 'sticky', top: 0, zIndex: 1 }}>
                <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Day</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Start Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>End Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Classroom</TableCell>
                {isTeacherOrAdmin && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={isTeacherOrAdmin ? 6 : 5}>
                    <Skeleton variant="rectangular" height={40} />
                  </TableCell>
                </TableRow>
              )) : timetables.map((tt, idx) => (
                <TableRow
                  key={tt._id}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? 'background.default' : 'grey.50',
                    transition: 'background 0.2s',
                    '&:hover': { backgroundColor: 'primary.lighter', cursor: 'pointer' },
                  }}
                >
                  <TableCell>{courses.find(c => c._id === (tt.course._id || tt.course))?.name || 'N/A'}</TableCell>
                  <TableCell>{tt.dayOfWeek}</TableCell>
                  <TableCell>{tt.startTime}</TableCell>
                  <TableCell>{tt.endTime}</TableCell>
                  <TableCell>{tt.classroom}</TableCell>
                  {isTeacherOrAdmin && (
                    <TableCell>
                      <Tooltip title="Edit Timetable"><IconButton onClick={() => handleOpen(tt)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete Timetable"><IconButton onClick={() => handleDelete(tt._id)}><DeleteIcon /></IconButton></Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {editingId ? 'Edit Timetable' : 'Add Timetable'}
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <form id="tt-form" onSubmit={handleSubmit}>
            <TextField
              select
              label="Course"
              name="course"
              value={form.course}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
            >
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </TextField>
            <TextField
              select
              label="Day of Week"
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              variant="outlined"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </TextField>
            <TextField label="Start Time" name="startTime" type="time" value={form.startTime} onChange={handleChange} fullWidth margin="normal" required variant="outlined" InputLabelProps={{ shrink: true }} />
            <TextField label="End Time" name="endTime" type="time" value={form.endTime} onChange={handleChange} fullWidth margin="normal" required variant="outlined" InputLabelProps={{ shrink: true }} />
            <TextField label="Classroom" name="classroom" value={form.classroom} onChange={handleChange} fullWidth margin="normal" required variant="outlined" />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="tt-form" variant="contained">{editingId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetableList; 