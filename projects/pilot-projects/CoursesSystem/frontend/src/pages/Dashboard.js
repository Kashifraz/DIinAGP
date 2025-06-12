import React, { useEffect, useState, useMemo } from 'react';
import { getUser, clearAuth } from '../utils/auth';
import { Box, Typography, Paper, Button, Avatar, Alert, CircularProgress, Grid, Card, CardContent, Divider, Tooltip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import { useLocation } from 'react-router-dom';
import { getCourses, getEnrolledStudents } from '../api/courses';
import { getAttendanceHistory, getAttendanceMatrix } from '../api/attendance';
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#4caf50', '#f44336', '#ffeb3b']; // Present, Absent, Not Marked
const STATUS_LABELS = ['Present', 'Absent', 'Not Marked'];

const getStats = (history) => {
  let present = 0, absent = 0, notMarked = 0;
  history.forEach(h => {
    if (h.status === 'present') present++;
    else if (h.status === 'absent') absent++;
    else notMarked++;
  });
  return [present, absent, notMarked];
};

const Dashboard = ({ onLogout }) => {
  const user = useMemo(() => getUser(), []);
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (!user) return;
    if (user.role === 'student') {
      setLoading(true);
      const fetchData = async () => {
        try {
          const res = await getCourses();
          if (!isMounted) return;
          setCourses(res.data);
          const statsObj = {};
          await Promise.all(res.data.map(async (course) => {
            try {
              const histRes = await getAttendanceHistory(course._id);
              if (!isMounted) return;
              const [present, absent, notMarked] = getStats(histRes.data);
              statsObj[course._id] = { present, absent, notMarked, total: histRes.data.length };
            } catch {
              statsObj[course._id] = { present: 0, absent: 0, notMarked: 0, total: 0 };
            }
          }));
          if (!isMounted) return;
          setStats(statsObj);
          setError('');
        } catch {
          if (!isMounted) return;
          setError('Failed to fetch courses or attendance');
        }
        if (isMounted) setLoading(false);
      };
      fetchData();
    } else if (user.role === 'teacher' || user.role === 'admin') {
      setLoading(true);
      const fetchTeacherData = async () => {
        try {
          const res = await getCourses();
          if (!isMounted) return;
          // Only courses where user is teacher (handle both string and object, compare as strings, fallback to email)
          const teacherCourses = res.data.filter(c => {
            if (!c.teacher) return false;
            const courseTeacherId = c.teacher._id ? String(c.teacher._id) : null;
            const userId = String(user._id);
            const idMatch = courseTeacherId === userId;
            const emailMatch = c.teacher.email && user.email && c.teacher.email === user.email;
            return idMatch || emailMatch;
          });
          setCourses(teacherCourses);
          const statsObj = {};
          await Promise.all(teacherCourses.map(async (course) => {
            try {
              // Get enrolled students
              const studentsRes = await getEnrolledStudents(course._id);
              const students = studentsRes.data;
              // Get attendance matrix
              const matrixRes = await getAttendanceMatrix(course._id);
              const { students: matrixStudents, columns, matrix } = matrixRes.data;
              // Calculate average attendance percentage
              let totalPercent = 0;
              let count = 0;
              matrixStudents.forEach(s => {
                let present = 0, total = 0;
                for (let i = 0; i < columns.length; i++) {
                  const status = matrix[s._id][i];
                  if (status === 'present') present++;
                  if (status === 'present' || status === 'absent') total++;
                }
                if (total > 0) {
                  totalPercent += (present / total) * 100;
                  count++;
                }
              });
              const avgAttendance = count > 0 ? (totalPercent / count).toFixed(1) : 'N/A';
              statsObj[course._id] = {
                enrolled: students.length,
                avgAttendance: avgAttendance,
              };
            } catch {
              statsObj[course._id] = { enrolled: 0, avgAttendance: 'N/A' };
            }
          }));
          if (!isMounted) return;
          setStats(statsObj);
          setError('');
        } catch {
          if (!isMounted) return;
          setError('Failed to fetch courses or stats');
        }
        if (isMounted) setLoading(false);
      };
      fetchTeacherData();
    }
    return () => { isMounted = false; };
  }, []);

  const handleLogout = () => {
    clearAuth();
    if (onLogout) onLogout();
  };

  if (!user) return <Box p={4}><Typography>Not logged in.</Typography></Box>;

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
      <Paper elevation={4} sx={{ p: 4, width: 350, textAlign: 'center', mb: 4, borderRadius: 3, boxShadow: 6 }}>
        {location.state?.forbidden && (
          <Alert severity="error" sx={{ mb: 2 }}>
            You are not authorized to access that page.
          </Alert>
        )}
        <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
          <PersonIcon fontSize="large" />
        </Avatar>
        <Typography variant="h5" mb={2} fontWeight={700}>Dashboard</Typography>
        <Typography><b>Name:</b> {user.name}</Typography>
        <Typography><b>Email:</b> {user.email}</Typography>
        <Typography><b>Role:</b> {user.role}</Typography>
        <Button variant="contained" color="secondary" fullWidth sx={{ mt: 3, borderRadius: 2 }} onClick={handleLogout}>
          Logout
        </Button>
      </Paper>
      {user.role === 'student' && (
        <Box width="100%" maxWidth={1200}>
          <Typography variant="h5" mb={3} align="center" fontWeight={600} letterSpacing={1}>
            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />My Courses & Attendance Stats
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {loading ? <Box p={3}><CircularProgress /></Box> : error ? <Box p={3}><Alert severity="error">{error}</Alert></Box> : (
            <Grid container spacing={3}>
              {courses.map(course => (
                <Grid item xs={12} md={6} lg={4} key={course._id}>
                  <Card
                    elevation={6}
                    sx={{
                      borderRadius: 3,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px) scale(1.02)', boxShadow: 10 },
                      bgcolor: 'background.paper',
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <ClassIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" fontWeight={600}>{course.name}</Typography>
                      </Box>
                      <Typography variant="body2" mb={2} color="text.secondary">{course.description}</Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Tooltip title="Present"><CheckCircleIcon color="success" /></Tooltip>
                        <Typography fontWeight={500}>Present: <b>{stats[course._id]?.present}</b></Typography>
                        <Tooltip title="Absent"><CancelIcon color="error" /></Tooltip>
                        <Typography fontWeight={500}>Absent: <b>{stats[course._id]?.absent}</b></Typography>
                        <Tooltip title="Not Marked"><HelpIcon color="warning" /></Tooltip>
                        <Typography fontWeight={500}>Not Marked: <b>{stats[course._id]?.notMarked}</b></Typography>
                      </Box>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={STATUS_LABELS.map((label, i) => ({ name: label, value: stats[course._id]?.[label.toLowerCase().replace(' ', '')] }))}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            label
                          >
                            {STATUS_LABELS.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                          </Pie>
                          <ReTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      {['teacher', 'admin'].includes(user.role) && (
        <Box width="100%" maxWidth={1200}>
          <Typography variant="h5" mb={3} align="center" fontWeight={600} letterSpacing={1}>
            <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />My Courses & Class Attendance Stats
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {loading ? <Box p={3}><CircularProgress /></Box> : error ? <Box p={3}><Alert severity="error">{error}</Alert></Box> : (
            courses.length === 0 ? (
              <Alert severity="info">
                No courses found for you.<br />
                <b>Your user ID:</b> {user._id}<br />
                <b>Your email:</b> {user.email}<br />
                <b>Check the browser console for debug info.</b>
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {courses.map(course => (
                  <Grid item xs={12} md={6} lg={4} key={course._id}>
                    <Card
                      elevation={6}
                      sx={{
                        borderRadius: 3,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { transform: 'translateY(-4px) scale(1.02)', boxShadow: 10 },
                        bgcolor: 'background.paper',
                      }}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ClassIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" fontWeight={600}>{course.name}</Typography>
                        </Box>
                        <Typography variant="body2" mb={2} color="text.secondary">{course.description}</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Tooltip title="Enrolled Students"><GroupIcon color="info" /></Tooltip>
                          <Typography fontWeight={500}>Enrolled: <b>{stats[course._id]?.enrolled}</b></Typography>
                          <Tooltip title="Average Attendance"><BarChartIcon color="primary" /></Tooltip>
                          <Typography fontWeight={500}>Avg Attendance: <b>{stats[course._id]?.avgAttendance}%</b></Typography>
                        </Box>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart data={[{ name: 'Avg Attendance', value: Number(stats[course._id]?.avgAttendance) || 0 }]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <ReTooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#4caf50" name="Average Attendance %" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          )}
        </Box>
      )}
    </Box>
  );
};

export default Dashboard; 