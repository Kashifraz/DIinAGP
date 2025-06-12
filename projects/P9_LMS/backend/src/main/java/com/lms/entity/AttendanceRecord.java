package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", indexes = {
    @Index(name = "idx_attendance_record_session", columnList = "session_id"),
    @Index(name = "idx_attendance_record_student", columnList = "student_id"),
    @Index(name = "idx_attendance_record_course", columnList = "course_id"),
    @Index(name = "idx_attendance_record_status", columnList = "status")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_session_student_record", columnNames = {"session_id", "student_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AttendanceSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "qr_code_used", nullable = false, length = 255)
    private String qrCodeUsed;

    @Column(name = "scan_timestamp", nullable = false)
    private LocalDateTime scanTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PRESENT;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum Status {
        PRESENT,
        ABSENT
    }
}

