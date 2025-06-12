import React, { useEffect, useState } from 'react';
import { getCourses } from '../api/courses';
import { getAttendanceHistory } from '../api/attendance';
import { Box, Typography, Paper, CircularProgress, Grid, Alert } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const StudentCoursesStats = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getCourses();
        setCourses(res.data);
        // For each course, fetch attendance history
        const statsObj = {};
        await Promise.all(res.data.map(async (course) => {
          try {
            const histRes = await getAttendanceHistory(course._id);
            const [present, absent, notMarked] = getStats(histRes.data);
            statsObj[course._id] = { present, absent, notMarked, total: histRes.data.length };
          } catch {
            statsObj[course._id] = { present: 0, absent: 0, notMarked: 0, total: 0 };
          }
        }));
        setStats(statsObj);
        setError('');
      } catch {
        setError('Failed to fetch courses or attendance');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <Box p={3}><CircularProgress /></Box>;
  if (error) return <Box p={3}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>My Courses & Attendance Stats</Typography>
      <Grid container spacing={3}>
        {courses.map(course => (
          <Grid item xs={12} md={6} lg={4} key={course._id}>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" mb={1}>{course.name}</Typography>
              <Typography variant="body2" mb={2}>{course.description}</Typography>
              <Typography mb={1}>
                Present: <b>{stats[course._id]?.present}</b> | Absent: <b>{stats[course._id]?.absent}</b> | Not Marked: <b>{stats[course._id]?.notMarked}</b>
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StudentCoursesStats; 