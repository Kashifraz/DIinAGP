package com.lms.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateModuleRequest {
    @Size(max = 255, message = "Module name must not exceed 255 characters")
    private String name;

    private String description;

    private Integer displayOrder;
}

