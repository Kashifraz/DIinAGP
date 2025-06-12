package com.lms.dto;

import com.lms.entity.Assessment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long professorId;
    private String professorName;
    private String title;
    private String description;
    private Assessment.AssessmentType assessmentType;
    private BigDecimal weightPercentage;
    private BigDecimal maximumMarks;
    private LocalDateTime deadline;
    private Integer timeLimitMinutes;
    private Assessment.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

