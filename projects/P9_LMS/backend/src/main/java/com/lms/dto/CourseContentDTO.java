package com.lms.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CourseContentDTO {
    private Long id;
    private Long moduleId;
    private String moduleName;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private String title;
    private String description;
    private String contentType;
    private String filePath;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private Long uploaderId;
    private String uploaderName;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

