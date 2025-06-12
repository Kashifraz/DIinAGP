package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfessorDashboardDTO {
    // Assigned courses
    private List<CourseDTO> assignedCourses;
    private Long totalAssignedCourses;
    
    // Upcoming deadlines (next 7 days)
    private List<AssessmentDTO> upcomingDeadlines;
    
    // Pending grading tasks
    private Long pendingGradingCount;
    private List<SubmissionDTO> pendingGradings; // Recent submissions needing grading
    
    // Today's classes
    private List<TimetableEntryDTO> todaysClasses;
    
    // Recent submissions (last 10)
    private List<SubmissionDTO> recentSubmissions;
    
    // Statistics
    private Long totalAssessments;
    private Long totalSubmissions;
    private Long gradedSubmissions;
}

