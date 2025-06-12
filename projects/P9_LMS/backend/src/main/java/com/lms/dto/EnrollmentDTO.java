package com.lms.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EnrollmentDTO {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private Long studentId;
    private String studentFirstName;
    private String studentLastName;
    private String studentEmail;
    private LocalDate enrollmentDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

