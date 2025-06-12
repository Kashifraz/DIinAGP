import React, { useEffect, useState } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse, enrollStudent, getEnrolledStudents, removeEnrolledStudent } from '../api/courses';
import { getUser } from '../utils/auth';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Divider, Tooltip, Fab, Skeleton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import ClassIcon from '@mui/icons-material/Class';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const emptyForm = { code: '', name: '', creditHours: '', description: '' };

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getUser();
  const isTeacherOrAdmin = user && (user.role === 'teacher' || user.role === 'admin');
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getCourses();
      setCourses(res.data);
    } catch (err) {
      setError('Failed to fetch courses');
    }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpen = (course = emptyForm) => {
    setForm(course);
    setEditingId(course._id || null);
    setOpen(true);
    setError('');
    setSuccess('');
    if (isTeacherOrAdmin && course._id) {
      setSelectedCourseId(course._id);
      fetchEnrolledStudents(course._id);
    } else {
      setSelectedCourseId(null);
      setEnrolledStudents([]);
    }
  };
  const handleClose = () => { setOpen(false); setForm(emptyForm); setEditingId(null); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCourse(editingId, form);
        setSuccess('Course updated');
      } else {
        await createCourse(form);
        setSuccess('Course created');
      }
      handleClose();
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving course');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (err) {
      setError('Error deleting course');
    }
  };

  const fetchEnrolledStudents = async (courseId) => {
    try {
      const res = await getEnrolledStudents(courseId);
      setEnrolledStudents(res.data);
    } catch {
      setEnrolledStudents([]);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setEnrollError('');
    setEnrollSuccess('');
    try {
      await enrollStudent(selectedCourseId, enrollEmail);
      setEnrollSuccess('Student enrolled');
      setEnrollEmail('');
      fetchEnrolledStudents(selectedCourseId);
    } catch (err) {
      setEnrollError(err.response?.data?.message || 'Failed to enroll student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the course?')) return;
    try {
      await removeEnrolledStudent(selectedCourseId, studentId);
      fetchEnrolledStudents(selectedCourseId);
    } catch {
      setEnrollError('Failed to remove student');
    }
  };

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <ClassIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700} letterSpacing={1}>
          Courses
        </Typography>
        {isTeacherOrAdmin && (
          <Tooltip title="Add Course">
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
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Credit Hours</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Teacher</TableCell>
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
              )) : courses.map((course, idx) => (
                <TableRow
                  key={course._id}
                  sx={{
                    backgroundColor: idx % 2 === 0 ? 'background.default' : 'grey.50',
                    transition: 'background 0.2s',
                    '&:hover': { backgroundColor: 'primary.lighter', cursor: 'pointer' },
                  }}
                >
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.creditHours}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>{course.teacher?.name}</TableCell>
                  {isTeacherOrAdmin && (
                    <TableCell>
                      <Tooltip title="Edit Course"><IconButton onClick={() => handleOpen(course)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete Course"><IconButton onClick={() => handleDelete(course._id)}><DeleteIcon /></IconButton></Tooltip>
                      <Tooltip title="View Enrolled Students"><IconButton onClick={() => navigate(`/courses/${course._id}/students`)}><GroupIcon /></IconButton></Tooltip>
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
          {editingId ? 'Edit Course' : 'Add Course'}
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <form id="course-form" onSubmit={handleSubmit}>
            <TextField label="Code" name="code" value={form.code} onChange={handleChange} fullWidth margin="normal" required disabled={!!editingId} variant="outlined" />
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth margin="normal" required variant="outlined" />
            <TextField label="Credit Hours" name="creditHours" type="number" value={form.creditHours} onChange={handleChange} fullWidth margin="normal" required variant="outlined" />
            <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth margin="normal" variant="outlined" />
          </form>
          {isTeacherOrAdmin && editingId && (
            <Box mt={3}>
              <Typography variant="h6" mb={1}>Enrolled Students</Typography>
              <form onSubmit={handleEnroll} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <TextField label="Student Email" value={enrollEmail} onChange={e => setEnrollEmail(e.target.value)} size="small" variant="outlined" />
                <Button type="submit" variant="contained">Add</Button>
              </form>
              {enrollError && <Alert severity="error" sx={{ mb: 1 }}>{enrollError}</Alert>}
              {enrollSuccess && <Alert severity="success" sx={{ mb: 1 }}>{enrollSuccess}</Alert>}
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {enrolledStudents.map(s => (
                      <TableRow key={s._id}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>
                          <Button color="error" size="small" onClick={() => handleRemoveStudent(s._id)}>Remove</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="course-form" variant="contained">{editingId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseList; 