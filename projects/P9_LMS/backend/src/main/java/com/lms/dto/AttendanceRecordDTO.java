package com.lms.dto;

import com.lms.entity.AttendanceRecord;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordDTO {
    private Long id;
    private Long sessionId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private String qrCodeUsed;
    private LocalDateTime scanTimestamp;
    private AttendanceRecord.Status status;
    private LocalDate sessionDate; // Add session date for matching with timetable
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

