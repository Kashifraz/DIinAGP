package com.lms.dto;

import com.lms.entity.AttendanceSession;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSessionDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Long professorId;
    private String professorName;
    private LocalDate sessionDate;
    private String qrCode;
    private LocalDateTime qrCodeExpiresAt;
    private AttendanceSession.Status status;
    private Integer totalStudents;
    private Integer presentCount;
    private Integer absentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

