package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeDTO {
    private Long id;
    private Long submissionId;
    private Long assessmentId;
    private String assessmentTitle;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private BigDecimal marksObtained;
    private BigDecimal maximumMarks;
    private BigDecimal weightPercentage;
    private String feedback;
    private Long gradedById;
    private String gradedByName;
    private LocalDateTime gradedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

