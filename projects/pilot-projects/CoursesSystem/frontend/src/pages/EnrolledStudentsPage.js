import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseStudentsWithAttendance, getAttendanceMatrix } from '../api/attendance';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert } from '@mui/material';
import * as XLSX from 'xlsx';

const statusLabel = {
  present: 'Present',
  absent: 'Absent',
  not_marked: 'Not Marked',
};
const statusColor = {
  present: { fgColor: { rgb: 'FF00C853' }, font: { color: { rgb: 'FFFFFFFF' } } }, // Green
  absent: { fgColor: { rgb: 'FFD50000' }, font: { color: { rgb: 'FFFFFFFF' } } }, // Red
  not_marked: { fgColor: { rgb: 'FFFFF176' }, font: { color: { rgb: 'FF000000' } } }, // Yellow
};

const EnrolledStudentsPage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCourseStudentsWithAttendance(courseId)
      .then(res => {
        setStudents(res.data);
        setError('');
      })
      .catch(() => setError('Failed to fetch students'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await getAttendanceMatrix(courseId);
      const { students, columns, matrix } = res.data;
      // Build worksheet data
      const header = ['Name', 'Email', ...columns.map(c => c.label)];
      const wsData = [header];
      students.forEach(student => {
        const row = [student.name, student.email];
        for (let i = 0; i < columns.length; i++) {
          const status = matrix[student._id][i];
          row.push(statusLabel[status] || 'Not Marked');
        }
        wsData.push(row);
      });
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      // Style cells
      students.forEach((student, i) => {
        for (let j = 0; j < columns.length; j++) {
          const status = matrix[student._id][j];
          const cellRef = XLSX.utils.encode_cell({ r: i + 1, c: j + 2 });
          if (!ws[cellRef]) continue;
          ws[cellRef].s = statusColor[status] || statusColor['not_marked'];
        }
      });
      // Style header
      for (let c = 0; c < header.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c });
        if (ws[cellRef]) {
          ws[cellRef].s = { font: { bold: true } };
        }
      }
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
      // Export
      XLSX.writeFile(wb, 'attendance_by_timetable.xlsx', { cellStyles: true });
    } catch (e) {
      alert('Failed to export attendance');
    }
    setExporting(false);
  };

  return (
    <Box p={3}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back to Courses</Button>
      <Typography variant="h4" mb={2}>Enrolled Students</Typography>
      <Button variant="contained" color="success" sx={{ mb: 2 }} onClick={handleExport} disabled={exporting}>
        {exporting ? 'Exporting...' : 'Export to Excel'}
      </Button>
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Attendance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map(s => (
                <TableRow key={s._id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.attendancePercentage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EnrolledStudentsPage; 