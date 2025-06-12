package com.lms.dto;

import com.lms.entity.CourseMajor;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateMajorRequest {
    @Size(min = 2, max = 255, message = "Major name must be between 2 and 255 characters")
    private String name;

    private String description;

    private CourseMajor.Status status;
}

