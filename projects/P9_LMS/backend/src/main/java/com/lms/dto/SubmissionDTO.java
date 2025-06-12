package com.lms.dto;

import com.lms.entity.Submission;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionDTO {
    private Long id;
    private Long assessmentId;
    private String assessmentTitle;
    private String assessmentType;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String submittedFilePath;
    private Map<String, String> submittedAnswers;
    private LocalDateTime submissionDate;
    private Submission.Status status;
    private Long gradeId;
    private BigDecimal marksObtained;
    private String feedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

