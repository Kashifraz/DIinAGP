package com.lms.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContentModuleDTO {
    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private String name;
    private String description;
    private Integer displayOrder;
    private List<CourseContentDTO> contents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

