package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardDTO {
    // Enrolled courses
    private List<EnrollmentDTO> enrolledCourses;
    private Long totalEnrolledCourses;
    
    // Upcoming assignments (next 14 days)
    private List<AssessmentDTO> upcomingAssignments;
    
    // Recent grades (last 10)
    private List<GradeDTO> recentGrades;
    
    // Today's schedule
    private List<TimetableEntryDTO> todaysSchedule;
    
    // Attendance summary
    private AttendanceSummaryDTO attendanceSummary;
    
    // Statistics
    private Long totalAssignments;
    private Long completedAssignments;
    private Long pendingAssignments;
    private Double averageGrade; // Overall average grade across all courses

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummaryDTO {
        private Long totalClasses;
        private Long presentCount;
        private Long absentCount;
        private Double attendancePercentage;
    }
}

