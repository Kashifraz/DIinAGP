package com.lms.dto;

import com.lms.entity.CourseGrade;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseGradeDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private BigDecimal overallGrade;
    private CourseGrade.GradeLetter gradeLetter;
    private LocalDateTime lastCalculatedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

