package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateCourseRequest {
    @NotBlank(message = "Course code is required")
    @Size(max = 50, message = "Course code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Course name is required")
    @Size(max = 255, message = "Course name must not exceed 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Major ID is required")
    private Long majorId;

    private Long professorId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer creditHours = 0;
}

