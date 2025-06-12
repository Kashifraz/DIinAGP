import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getTimetables, getTimetablesByCourse } from '../api/timetables';
import { getCourses } from '../api/courses';
import { getAttendanceHistory, getCalendarSessions } from '../api/attendance';
import { getUser } from '../utils/auth';
import { Box, Typography, Paper, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Select, InputLabel, FormControl, Divider, Skeleton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const dayToIndex = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 0,
};

function getNextDate(dayOfWeek) {
  const today = new Date();
  const resultDate = new Date(today);
  const day = dayToIndex[dayOfWeek];
  const diff = (day + 7 - today.getDay()) % 7;
  resultDate.setDate(today.getDate() + diff);
  return resultDate;
}

const CalendarView = () => {
  const [timetables, setTimetables] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [calendarSessions, setCalendarSessions] = useState([]);
  const [courseTimetables, setCourseTimetables] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const user = getUser();
  const isStudent = user?.role === 'student';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ttRes, cRes] = await Promise.all([
          getTimetables(),
          getCourses()
        ]);
        setTimetables(ttRes.data);
        setCourses(cRes.data);
      } catch (err) {
        setError('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isStudent && selectedCourse) {
      setLoading(true);
      Promise.all([
        getCalendarSessions(selectedCourse),
        getTimetablesByCourse(selectedCourse)
      ])
        .then(([sessionsRes, ttRes]) => {
          setCalendarSessions(sessionsRes.data);
          setCourseTimetables(ttRes.data);
        })
        .catch(() => {
          setCalendarSessions([]);
          setCourseTimetables([]);
        })
        .finally(() => setLoading(false));
    }
  }, [isStudent, selectedCourse]);

  useEffect(() => {
    if (isStudent) {
      setEnrolledCourses(courses);
    }
  }, [isStudent, courses]);

  // Timetable events (for all users)
  const timetableEvents = timetables.map(tt => {
    const course = courses.find(c => c._id === (tt.course._id || tt.course));
    const startDate = getNextDate(tt.dayOfWeek);
    const [startHour, startMinute] = tt.startTime.split(':');
    const [endHour, endMinute] = tt.endTime.split(':');
    const start = new Date(startDate);
    start.setHours(Number(startHour), Number(startMinute), 0, 0);
    const end = new Date(startDate);
    end.setHours(Number(endHour), Number(endMinute), 0, 0);
    return {
      id: tt._id,
      title: course ? course.name : 'Course',
      start,
      end,
      extendedProps: {
        classroom: tt.classroom,
        teacher: course?.teacher?.name,
        description: course?.description,
        dayOfWeek: tt.dayOfWeek,
        startTime: tt.startTime,
        endTime: tt.endTime,
      },
    };
  });

  // For each timetable, generate events for all sessions (past and future)
  const now = new Date();
  const attendanceMap = {};
  calendarSessions.forEach(s => {
    attendanceMap[
      `${s.date}|${s.startTime}|${s.endTime}`
    ] = s.status;
  });

  // Helper: get all dates for a timetable from its start to today+2 weeks
  function getSessionDates(timetable, from, to) {
    const result = [];
    let current = new Date(from);
    const end = new Date(to);
    const dayIdx = dayToIndex[timetable.dayOfWeek];
    // Move to the first occurrence of the correct day
    while (current.getDay() !== dayIdx) {
      current.setDate(current.getDate() + 1);
    }
    while (current <= end) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    return result;
  }

  let attendanceEvents = [];
  if (isStudent && selectedCourse && courseTimetables.length > 0) {
    // For each timetable, generate events for all sessions
    const from = new Date();
    from.setMonth(from.getMonth() - 2); // show last 2 months
    const to = new Date();
    to.setMonth(to.getMonth() + 2); // show next 2 months
    courseTimetables.forEach(tt => {
      const sessionDates = getSessionDates(tt, from, to);
      sessionDates.forEach(dateObj => {
        const dateStr = dateObj.toISOString().split('T')[0];
        const key = `${dateStr}|${tt.startTime}|${tt.endTime}`;
        let status = attendanceMap[key];
        let color = '#90caf9'; // blue for upcoming
        let label = '';
        // Determine if session is past or future
        const sessionEnd = new Date(dateObj);
        const [endHour, endMinute] = tt.endTime.split(':');
        sessionEnd.setHours(Number(endHour), Number(endMinute), 0, 0);
        if (sessionEnd < now) {
          if (status === 'present') {
            color = '#4caf50'; label = 'Present';
          } else if (status === 'absent') {
            color = '#f44336'; label = 'Absent';
          } else if (status === 'not_marked') {
            color = '#ffeb3b'; label = 'Not Marked';
          } else {
            color = '#ffeb3b'; label = 'Not Marked';
          }
        } else {
          color = '#90caf9'; label = 'Upcoming';
        }
        // Build event
        const start = new Date(dateObj);
        const [startHour, startMinute] = tt.startTime.split(':');
        const [endHour2, endMinute2] = tt.endTime.split(':');
        start.setHours(Number(startHour), Number(startMinute), 0, 0);
        const end = new Date(dateObj);
        end.setHours(Number(endHour2), Number(endMinute2), 0, 0);
        attendanceEvents.push({
          id: `${tt._id}|${dateStr}`,
          title: label,
          start,
          end,
          backgroundColor: color,
          borderColor: color,
          textColor: '#000',
          extendedProps: { status, timetable: tt },
        });
      });
    });
  }

  // For students, only show events if a course is selected
  let events = timetableEvents;
  if (isStudent) {
    events = selectedCourse ? attendanceEvents : [];
  }

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  return (
    <Box p={{ xs: 1, sm: 2, md: 4 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <CalendarTodayIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700} letterSpacing={1}>
          Class Calendar
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Paper elevation={4} sx={{ borderRadius: 3, boxShadow: 6, p: { xs: 1, sm: 2, md: 3 }, mb: 4, minHeight: 500 }}>
        {loading ? (
          <Box p={3}><Skeleton variant="rectangular" height={400} /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {isStudent && (
              <FormControl sx={{ minWidth: 220, mb: 2 }}>
                <InputLabel id="select-course-label">Select Course</InputLabel>
                <Select
                  labelId="select-course-label"
                  value={selectedCourse}
                  label="Select Course"
                  onChange={e => setSelectedCourse(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="">All Courses</MenuItem>
                  {enrolledCourses.map(course => (
                    <MenuItem key={course._id} value={course._id}>{course.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {isStudent && !selectedCourse ? (
              <Typography align="center" color="text.secondary" sx={{ mt: 4, mb: 4 }}>
                Please select a course to view your attendance calendar.
              </Typography>
            ) : (
              <FullCalendar
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{ left: 'prev,next today', center: 'title', right: 'timeGridWeek,dayGridMonth' }}
                events={events}
                height={650}
                eventContent={renderEventContent}
                eventClick={handleEventClick}
              />
            )}
          </>
        )}
      </Paper>
      <Dialog open={!!selectedEvent} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Class Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <Box>
              <Typography variant="h6" mb={1}>{selectedEvent.title}</Typography>
              <Typography><b>Day:</b> {selectedEvent.extendedProps.dayOfWeek}</Typography>
              <Typography><b>Time:</b> {selectedEvent.extendedProps.startTime} - {selectedEvent.extendedProps.endTime}</Typography>
              <Typography><b>Classroom:</b> {selectedEvent.extendedProps.classroom}</Typography>
              {selectedEvent.extendedProps.teacher && (
                <Typography><b>Teacher:</b> {selectedEvent.extendedProps.teacher}</Typography>
              )}
              {selectedEvent.extendedProps.description && (
                <Typography mt={1}><b>Description:</b> {selectedEvent.extendedProps.description}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

function renderEventContent(eventInfo) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Typography variant="caption" fontWeight={600} sx={{ color: eventInfo.backgroundColor, mb: 0.5 }}>
        {eventInfo.event.title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {eventInfo.timeText}
      </Typography>
    </Box>
  );
}

export default CalendarView; 