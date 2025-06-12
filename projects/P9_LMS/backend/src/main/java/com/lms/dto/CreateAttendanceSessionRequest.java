package com.lms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateAttendanceSessionRequest {
    @NotNull(message = "Session date is required")
    private LocalDate sessionDate;
    
    private Integer durationMinutes; // Optional, defaults to 15 minutes
}

