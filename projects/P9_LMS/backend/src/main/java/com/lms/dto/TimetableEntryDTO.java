package com.lms.dto;

import com.lms.entity.TimetableEntry;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimetableEntryDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private TimetableEntry.DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private String location;
    private LocalDate courseStartDate; // Course start date
    private LocalDate courseEndDate; // Course end date
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}

