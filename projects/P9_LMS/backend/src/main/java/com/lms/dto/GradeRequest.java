package com.lms.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GradeRequest {
    @NotNull(message = "Marks obtained is required")
    @DecimalMin(value = "0.00", message = "Marks cannot be negative")
    private BigDecimal marksObtained;

    private String feedback;
}

