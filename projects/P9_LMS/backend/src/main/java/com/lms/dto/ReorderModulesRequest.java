package com.lms.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReorderModulesRequest {
    @NotEmpty(message = "Module IDs list cannot be empty")
    private List<Long> moduleIds;
}

