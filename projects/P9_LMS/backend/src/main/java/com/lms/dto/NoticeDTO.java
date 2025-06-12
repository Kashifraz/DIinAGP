package com.lms.dto;

import com.lms.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticeDTO {
    private Long id;
    private Long coordinatorId;
    private String coordinatorName;
    private String title;
    private String content;
    private Notice.Category category;
    private Notice.Priority priority;
    private LocalDateTime expirationDate;
    private Notice.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long readCount; // Number of users who read this notice
    private boolean isRead; // Whether current user has read this notice
}

