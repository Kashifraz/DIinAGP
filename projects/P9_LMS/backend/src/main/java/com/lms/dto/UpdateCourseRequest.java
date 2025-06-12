package com.lms.dto;

import com.lms.entity.Course;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateCourseRequest {
    @Size(max = 50, message = "Course code must not exceed 50 characters")
    private String code;

    @Size(max = 255, message = "Course name must not exceed 255 characters")
    private String name;

    private String description;

    private Long majorId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer creditHours;

    private Course.Status status;
}

