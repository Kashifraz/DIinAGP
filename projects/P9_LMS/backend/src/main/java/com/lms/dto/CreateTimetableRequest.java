package com.lms.dto;

import com.lms.entity.TimetableEntry;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class CreateTimetableRequest {
    @NotNull(message = "Day of week is required")
    private TimetableEntry.DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private String location;
}

