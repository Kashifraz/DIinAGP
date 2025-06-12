package com.lms.dto;

import com.lms.entity.Assessment;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateAssessmentRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    @NotNull(message = "Assessment type is required")
    private Assessment.AssessmentType assessmentType;

    @NotNull(message = "Weight percentage is required")
    @DecimalMin(value = "0.01", message = "Weight percentage must be greater than 0")
    @DecimalMax(value = "100.00", message = "Weight percentage must not exceed 100")
    private BigDecimal weightPercentage;

    @NotNull(message = "Maximum marks is required")
    @DecimalMin(value = "0.01", message = "Maximum marks must be greater than 0")
    private BigDecimal maximumMarks;

    private LocalDateTime deadline;

    @Min(value = 1, message = "Time limit must be at least 1 minute")
    private Integer timeLimitMinutes;
}

