package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_grades", indexes = {
    @Index(name = "idx_course_grade_course", columnList = "course_id"),
    @Index(name = "idx_course_grade_student", columnList = "student_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_course_student", columnNames = {"course_id", "student_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "overall_grade", nullable = false, precision = 10, scale = 2)
    private BigDecimal overallGrade;

    @Enumerated(EnumType.STRING)
    @Column(name = "grade_letter")
    private GradeLetter gradeLetter;

    @Column(name = "last_calculated_at", nullable = false)
    private LocalDateTime lastCalculatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum GradeLetter {
        A, B, C, D, F
    }
}

