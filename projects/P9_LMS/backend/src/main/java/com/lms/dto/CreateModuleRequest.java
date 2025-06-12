package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateModuleRequest {
    // courseId is set from path variable, no need to validate here
    private Long courseId;

    @NotBlank(message = "Module name is required")
    @Size(max = 255, message = "Module name must not exceed 255 characters")
    private String name;

    private String description;

    private Integer displayOrder = 0;
}

