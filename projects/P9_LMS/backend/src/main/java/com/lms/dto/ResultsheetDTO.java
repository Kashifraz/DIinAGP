package com.lms.dto;

import com.lms.entity.CourseGrade;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResultsheetDTO {
    // Student Information
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentIdNumber; // Optional student ID number
    
    // Course Information
    private Long courseId;
    private String courseCode;
    private String courseName;
    private String majorName;
    private Integer creditHours;
    
    // Assessment Breakdown
    private List<AssessmentGradeDTO> assessmentGrades;
    
    // Overall Grade Information
    private BigDecimal overallGrade;
    private CourseGrade.GradeLetter gradeLetter;
    private LocalDateTime lastCalculatedAt;
    
    // Summary Statistics
    private BigDecimal totalWeight;
    private Integer totalAssessments;
    private Integer gradedAssessments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssessmentGradeDTO {
        private Long assessmentId;
        private String assessmentTitle;
        private String assessmentType;
        private BigDecimal marksObtained;
        private BigDecimal maximumMarks;
        private BigDecimal weightPercentage;
        private BigDecimal percentageScore; // (marksObtained / maximumMarks) * 100
        private BigDecimal weightedScore; // percentageScore * (weightPercentage / 100)
        private String feedback;
        private LocalDateTime gradedAt;
    }
}
