package com.lms.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkEnrollmentRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotEmpty(message = "At least one student ID is required")
    private List<Long> studentIds;
}

