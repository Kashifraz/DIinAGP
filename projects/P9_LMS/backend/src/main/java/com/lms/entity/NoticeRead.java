package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice_reads", indexes = {
    @Index(name = "idx_notice_read_notice", columnList = "notice_id"),
    @Index(name = "idx_notice_read_user", columnList = "user_id"),
    @Index(name = "idx_notice_read_read_at", columnList = "read_at")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_notice_read", columnNames = {"notice_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id", nullable = false)
    private Notice notice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "read_at", nullable = false)
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

