package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoordinatorDashboardDTO {
    // Statistics
    private Long totalUsers;
    private Long totalStudents;
    private Long totalProfessors;
    private Long totalCoordinators;
    private Long totalCourses;
    private Long activeCourses;
    private Long totalMajors;
    private Long activeMajors;
    private Long totalEnrollments;
    private Long activeEnrollments;
    
    // Recent notices (last 5)
    private List<NoticeDTO> recentNotices;
    
    // Quick stats
    private Long unassignedCourses; // Courses without professors
    private Long coursesNeedingAttention; // Courses with issues
}

