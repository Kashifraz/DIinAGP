package com.lms.service;

import com.lms.dto.*;
import com.lms.entity.*;
import com.lms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMajorRepository courseMajorRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private TimetableEntryRepository timetableRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private CourseService courseService;

    @Autowired
    private AssessmentService assessmentService;

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private GradeService gradeService;

    @Autowired
    private TimetableService timetableService;

    @Autowired
    private AttendanceService attendanceService;

    public CoordinatorDashboardDTO getCoordinatorDashboard(Long coordinatorId) {
        CoordinatorDashboardDTO dashboard = new CoordinatorDashboardDTO();

        // User statistics
        dashboard.setTotalUsers(userRepository.count());
        dashboard.setTotalStudents(userRepository.countByRole(User.Role.STUDENT));
        dashboard.setTotalProfessors(userRepository.countByRole(User.Role.PROFESSOR));
        dashboard.setTotalCoordinators(userRepository.countByRole(User.Role.COORDINATOR));

        // Course statistics
        dashboard.setTotalCourses(courseRepository.count());
        dashboard.setActiveCourses(courseRepository.countByStatus(Course.Status.ACTIVE));
        dashboard.setUnassignedCourses(courseRepository.countByProfessorIdIsNull());

        // Major statistics
        dashboard.setTotalMajors(courseMajorRepository.count());
        dashboard.setActiveMajors(courseMajorRepository.countByStatus(CourseMajor.Status.ACTIVE));

        // Enrollment statistics
        dashboard.setTotalEnrollments(enrollmentRepository.count());
        dashboard.setActiveEnrollments(enrollmentRepository.countByStatus(CourseEnrollment.Status.ACTIVE));

        // Recent notices (last 5 published)
        List<Notice> recentNotices = noticeRepository.findByStatusOrderByCreatedAtDesc(Notice.Status.PUBLISHED)
                .stream()
                .limit(5)
                .collect(Collectors.toList());
        dashboard.setRecentNotices(recentNotices.stream()
                .map(this::convertNoticeToDTO)
                .collect(Collectors.toList()));

        // Courses needing attention (courses without professors)
        dashboard.setCoursesNeedingAttention(dashboard.getUnassignedCourses());

        return dashboard;
    }

    public ProfessorDashboardDTO getProfessorDashboard(Long professorId) {
        ProfessorDashboardDTO dashboard = new ProfessorDashboardDTO();

        // Assigned courses
        List<Course> assignedCourses = courseRepository.findByProfessorId(professorId);
        dashboard.setAssignedCourses(assignedCourses.stream()
                .map(course -> {
                    CourseDTO dto = new CourseDTO();
                    dto.setId(course.getId());
                    dto.setCode(course.getCode());
                    dto.setName(course.getName());
                    dto.setDescription(course.getDescription());
                    dto.setMajorId(course.getMajor().getId());
                    dto.setMajorName(course.getMajor().getName());
                    dto.setProfessorId(course.getProfessor() != null ? course.getProfessor().getId() : null);
                    dto.setProfessorName(course.getProfessor() != null ? 
                            course.getProfessor().getFirstName() + " " + course.getProfessor().getLastName() : null);
                    dto.setStartDate(course.getStartDate());
                    dto.setEndDate(course.getEndDate());
                    dto.setCreditHours(course.getCreditHours());
                    dto.setStatus(course.getStatus());
                    dto.setCreatedAt(course.getCreatedAt());
                    dto.setUpdatedAt(course.getUpdatedAt());
                    return dto;
                })
                .collect(Collectors.toList()));
        dashboard.setTotalAssignedCourses((long) assignedCourses.size());

        // Upcoming deadlines (next 7 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        List<Assessment> allAssessments = assessmentRepository.findByProfessorId(professorId);
        List<AssessmentDTO> upcomingDeadlines = allAssessments.stream()
                .filter(a -> a.getDeadline() != null 
                        && a.getDeadline().isAfter(now) 
                        && a.getDeadline().isBefore(sevenDaysLater)
                        && a.getStatus() == Assessment.Status.PUBLISHED)
                .sorted((a1, a2) -> a1.getDeadline().compareTo(a2.getDeadline()))
                .limit(10)
                .map(this::convertAssessmentToDTO)
                .collect(Collectors.toList());
        dashboard.setUpcomingDeadlines(upcomingDeadlines);

        // Pending grading tasks
        List<Submission> allSubmissions = submissionRepository.findAll().stream()
                .filter(s -> {
                    Assessment assessment = s.getAssessment();
                    return assessment != null 
                            && assessment.getProfessor() != null
                            && assessment.getProfessor().getId().equals(professorId)
                            && s.getStatus() == Submission.Status.SUBMITTED
                            && !gradeRepository.findBySubmissionId(s.getId()).isPresent();
                })
                .collect(Collectors.toList());
        dashboard.setPendingGradingCount((long) allSubmissions.size());
        dashboard.setPendingGradings(allSubmissions.stream()
                .limit(10)
                .map(this::convertSubmissionToDTO)
                .collect(Collectors.toList()));

        // Today's classes
        LocalDate today = LocalDate.now();
        String dayOfWeek = today.getDayOfWeek().name();
        List<TimetableEntry> todaysEntries = timetableRepository.findAll().stream()
                .filter(entry -> {
                    Course course = entry.getCourse();
                    return course != null 
                            && course.getProfessor() != null
                            && course.getProfessor().getId().equals(professorId)
                            && entry.getDayOfWeek().name().equals(dayOfWeek);
                })
                .sorted((e1, e2) -> e1.getStartTime().compareTo(e2.getStartTime()))
                .collect(Collectors.toList());
        dashboard.setTodaysClasses(todaysEntries.stream()
                .map(this::convertTimetableEntryToDTO)
                .collect(Collectors.toList()));

        // Recent submissions (last 10)
        List<Submission> recentSubmissions = submissionRepository.findAll().stream()
                .filter(s -> {
                    Assessment assessment = s.getAssessment();
                    return assessment != null 
                            && assessment.getProfessor() != null
                            && assessment.getProfessor().getId().equals(professorId);
                })
                .sorted((s1, s2) -> s2.getSubmissionDate().compareTo(s1.getSubmissionDate()))
                .limit(10)
                .collect(Collectors.toList());
        dashboard.setRecentSubmissions(recentSubmissions.stream()
                .map(this::convertSubmissionToDTO)
                .collect(Collectors.toList()));

        // Statistics
        dashboard.setTotalAssessments((long) allAssessments.size());
        long totalSubmissions = submissionRepository.findAll().stream()
                .filter(s -> {
                    Assessment assessment = s.getAssessment();
                    return assessment != null 
                            && assessment.getProfessor() != null
                            && assessment.getProfessor().getId().equals(professorId);
                })
                .count();
        dashboard.setTotalSubmissions(totalSubmissions);
        long gradedSubmissions = submissionRepository.findAll().stream()
                .filter(s -> {
                    Assessment assessment = s.getAssessment();
                    return assessment != null 
                            && assessment.getProfessor() != null
                            && assessment.getProfessor().getId().equals(professorId)
                            && gradeRepository.findBySubmissionId(s.getId()).isPresent();
                })
                .count();
        dashboard.setGradedSubmissions(gradedSubmissions);

        return dashboard;
    }

    public StudentDashboardDTO getStudentDashboard(Long studentId) {
        StudentDashboardDTO dashboard = new StudentDashboardDTO();

        // Enrolled courses
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(studentId, CourseEnrollment.Status.ACTIVE);
        dashboard.setEnrolledCourses(enrollments.stream()
                .map(this::convertEnrollmentToDTO)
                .collect(Collectors.toList()));
        dashboard.setTotalEnrolledCourses((long) enrollments.size());

        // Get course IDs
        List<Long> courseIds = enrollments.stream()
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toList());

        // Upcoming assignments (next 14 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime fourteenDaysLater = now.plusDays(14);
        List<Assessment> upcomingAssessments = assessmentRepository.findAll().stream()
                .filter(a -> courseIds.contains(a.getCourse().getId())
                        && a.getDeadline() != null
                        && a.getDeadline().isAfter(now)
                        && a.getDeadline().isBefore(fourteenDaysLater)
                        && a.getStatus() == Assessment.Status.PUBLISHED)
                .sorted((a1, a2) -> a1.getDeadline().compareTo(a2.getDeadline()))
                .limit(10)
                .collect(Collectors.toList());
        dashboard.setUpcomingAssignments(upcomingAssessments.stream()
                .map(this::convertAssessmentToDTO)
                .collect(Collectors.toList()));

        // Recent grades (last 10)
        List<Grade> recentGrades = gradeRepository.findByStudentId(studentId).stream()
                .sorted((g1, g2) -> g2.getCreatedAt().compareTo(g1.getCreatedAt()))
                .limit(10)
                .collect(Collectors.toList());
        dashboard.setRecentGrades(recentGrades.stream()
                .map(this::convertGradeToDTO)
                .collect(Collectors.toList()));

        // Today's schedule
        LocalDate today = LocalDate.now();
        String dayOfWeek = today.getDayOfWeek().name();
        List<TimetableEntry> todaysEntries = timetableRepository.findAll().stream()
                .filter(entry -> {
                    Course course = entry.getCourse();
                    return course != null 
                            && courseIds.contains(course.getId())
                            && entry.getDayOfWeek().name().equals(dayOfWeek);
                })
                .sorted((e1, e2) -> e1.getStartTime().compareTo(e2.getStartTime()))
                .collect(Collectors.toList());
        dashboard.setTodaysSchedule(todaysEntries.stream()
                .map(this::convertTimetableEntryToDTO)
                .collect(Collectors.toList()));

        // Attendance summary
        StudentDashboardDTO.AttendanceSummaryDTO attendanceSummary = new StudentDashboardDTO.AttendanceSummaryDTO();
        List<AttendanceRecord> allRecords = attendanceRecordRepository.findByStudentId(studentId);
        long presentCount = allRecords.stream()
                .filter(r -> r.getStatus() == AttendanceRecord.Status.PRESENT)
                .count();
        attendanceSummary.setPresentCount(presentCount);
        attendanceSummary.setAbsentCount((long) allRecords.size() - presentCount);
        attendanceSummary.setTotalClasses((long) allRecords.size());
        if (allRecords.size() > 0) {
            attendanceSummary.setAttendancePercentage((double) presentCount / allRecords.size() * 100);
        } else {
            attendanceSummary.setAttendancePercentage(0.0);
        }
        dashboard.setAttendanceSummary(attendanceSummary);

        // Statistics
        long totalAssignments = assessmentRepository.findAll().stream()
                .filter(a -> courseIds.contains(a.getCourse().getId())
                        && a.getStatus() == Assessment.Status.PUBLISHED)
                .count();
        dashboard.setTotalAssignments(totalAssignments);
        
        long completedAssignments = submissionRepository.findAll().stream()
                .filter(s -> {
                    Assessment assessment = s.getAssessment();
                    return assessment != null
                            && courseIds.contains(assessment.getCourse().getId())
                            && s.getStudent().getId().equals(studentId)
                            && s.getStatus() == Submission.Status.SUBMITTED;
                })
                .count();
        dashboard.setCompletedAssignments(completedAssignments);
        dashboard.setPendingAssignments(totalAssignments - completedAssignments);

        // Calculate average grade
        List<Grade> allGrades = gradeRepository.findByStudentId(studentId);
        if (!allGrades.isEmpty()) {
            double average = allGrades.stream()
                    .mapToDouble(g -> g.getMarksObtained() != null ? g.getMarksObtained().doubleValue() : 0.0)
                    .average()
                    .orElse(0.0);
            dashboard.setAverageGrade(average);
        } else {
            dashboard.setAverageGrade(0.0);
        }

        return dashboard;
    }

    private NoticeDTO convertNoticeToDTO(Notice notice) {
        NoticeDTO dto = new NoticeDTO();
        dto.setId(notice.getId());
        dto.setCoordinatorId(notice.getCoordinator().getId());
        dto.setCoordinatorName(notice.getCoordinator().getFirstName() + " " + notice.getCoordinator().getLastName());
        dto.setTitle(notice.getTitle());
        dto.setContent(notice.getContent());
        dto.setCategory(notice.getCategory());
        dto.setPriority(notice.getPriority());
        dto.setExpirationDate(notice.getExpirationDate());
        dto.setStatus(notice.getStatus());
        dto.setCreatedAt(notice.getCreatedAt());
        dto.setUpdatedAt(notice.getUpdatedAt());
        dto.setReadCount(0L); // Not needed for dashboard
        dto.setRead(false); // Not needed for dashboard
        return dto;
    }

    private EnrollmentDTO convertEnrollmentToDTO(CourseEnrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setCourseId(enrollment.getCourse().getId());
        dto.setCourseCode(enrollment.getCourse().getCode());
        dto.setCourseName(enrollment.getCourse().getName());
        dto.setStudentId(enrollment.getStudent().getId());
        dto.setStudentFirstName(enrollment.getStudent().getFirstName());
        dto.setStudentLastName(enrollment.getStudent().getLastName());
        dto.setStudentEmail(enrollment.getStudent().getEmail());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        dto.setStatus(enrollment.getStatus().name());
        dto.setCreatedAt(enrollment.getCreatedAt());
        dto.setUpdatedAt(enrollment.getUpdatedAt());
        return dto;
    }

    private AssessmentDTO convertAssessmentToDTO(Assessment assessment) {
        AssessmentDTO dto = new AssessmentDTO();
        dto.setId(assessment.getId());
        dto.setCourseId(assessment.getCourse().getId());
        dto.setCourseCode(assessment.getCourse().getCode());
        dto.setCourseName(assessment.getCourse().getName());
        dto.setProfessorId(assessment.getProfessor().getId());
        dto.setProfessorName(assessment.getProfessor().getFirstName() + " " + assessment.getProfessor().getLastName());
        dto.setTitle(assessment.getTitle());
        dto.setDescription(assessment.getDescription());
        dto.setAssessmentType(assessment.getAssessmentType());
        dto.setWeightPercentage(assessment.getWeightPercentage());
        dto.setMaximumMarks(assessment.getMaximumMarks());
        dto.setDeadline(assessment.getDeadline());
        dto.setTimeLimitMinutes(assessment.getTimeLimitMinutes());
        dto.setStatus(assessment.getStatus());
        dto.setCreatedAt(assessment.getCreatedAt());
        dto.setUpdatedAt(assessment.getUpdatedAt());
        return dto;
    }

    private SubmissionDTO convertSubmissionToDTO(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        dto.setAssessmentId(submission.getAssessment().getId());
        dto.setAssessmentTitle(submission.getAssessment().getTitle());
        dto.setAssessmentType(submission.getAssessment().getAssessmentType().name());
        dto.setStudentId(submission.getStudent().getId());
        dto.setStudentName(submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName());
        dto.setStudentEmail(submission.getStudent().getEmail());
        dto.setSubmittedFilePath(submission.getSubmittedFilePath());
        dto.setSubmittedAnswers(submission.getSubmittedAnswers());
        dto.setSubmissionDate(submission.getSubmissionDate());
        dto.setStatus(submission.getStatus());
        // Check if graded
        Optional<Grade> grade = gradeRepository.findBySubmissionId(submission.getId());
        if (grade.isPresent()) {
            dto.setGradeId(grade.get().getId());
            dto.setMarksObtained(grade.get().getMarksObtained());
            dto.setFeedback(grade.get().getFeedback());
        }
        dto.setCreatedAt(submission.getCreatedAt());
        dto.setUpdatedAt(submission.getUpdatedAt());
        return dto;
    }

    private GradeDTO convertGradeToDTO(Grade grade) {
        GradeDTO dto = new GradeDTO();
        dto.setId(grade.getId());
        dto.setSubmissionId(grade.getSubmission().getId());
        dto.setAssessmentId(grade.getAssessment().getId());
        dto.setAssessmentTitle(grade.getAssessment().getTitle());
        dto.setStudentId(grade.getStudent().getId());
        dto.setStudentName(grade.getStudent().getFirstName() + " " + grade.getStudent().getLastName());
        dto.setStudentEmail(grade.getStudent().getEmail());
        dto.setCourseId(grade.getCourse().getId());
        dto.setCourseName(grade.getCourse().getName());
        dto.setCourseCode(grade.getCourse().getCode());
        dto.setMarksObtained(grade.getMarksObtained());
        dto.setMaximumMarks(grade.getAssessment().getMaximumMarks());
        dto.setWeightPercentage(grade.getAssessment().getWeightPercentage());
        dto.setFeedback(grade.getFeedback());
        dto.setGradedById(grade.getGradedBy().getId());
        dto.setGradedByName(grade.getGradedBy().getFirstName() + " " + grade.getGradedBy().getLastName());
        dto.setGradedAt(grade.getGradedAt());
        dto.setCreatedAt(grade.getCreatedAt());
        dto.setUpdatedAt(grade.getUpdatedAt());
        return dto;
    }

    private TimetableEntryDTO convertTimetableEntryToDTO(TimetableEntry entry) {
        TimetableEntryDTO dto = new TimetableEntryDTO();
        dto.setId(entry.getId());
        dto.setCourseId(entry.getCourse().getId());
        dto.setCourseName(entry.getCourse().getName());
        dto.setCourseCode(entry.getCourse().getCode());
        dto.setDayOfWeek(entry.getDayOfWeek());
        dto.setStartTime(entry.getStartTime());
        dto.setEndTime(entry.getEndTime());
        dto.setDurationMinutes(entry.getDurationMinutes());
        dto.setLocation(entry.getLocation());
        dto.setCourseStartDate(entry.getCourse().getStartDate());
        dto.setCourseEndDate(entry.getCourse().getEndDate());
        dto.setCreatedAt(entry.getCreatedAt());
        dto.setUpdatedAt(entry.getUpdatedAt());
        return dto;
    }
}

