package com.lms.dto;

import com.lms.entity.Course;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long majorId;
    private String majorName;
    private Long professorId;
    private String professorName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer creditHours;
    private Course.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

