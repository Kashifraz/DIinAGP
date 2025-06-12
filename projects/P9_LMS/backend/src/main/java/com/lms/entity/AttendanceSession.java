package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_sessions", indexes = {
    @Index(name = "idx_attendance_session_course", columnList = "course_id"),
    @Index(name = "idx_attendance_session_professor", columnList = "professor_id"),
    @Index(name = "idx_attendance_session_date", columnList = "session_date"),
    @Index(name = "idx_attendance_session_status", columnList = "status"),
    @Index(name = "idx_attendance_session_qr_code", columnList = "qr_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    private User professor;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Column(name = "qr_code", nullable = false, unique = true, length = 255)
    private String qrCode;

    @Column(name = "qr_code_expires_at", nullable = false)
    private LocalDateTime qrCodeExpiresAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum Status {
        ACTIVE,
        EXPIRED,
        CLOSED
    }
}

