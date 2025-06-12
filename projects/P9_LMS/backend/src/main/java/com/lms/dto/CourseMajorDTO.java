package com.lms.dto;

import com.lms.entity.CourseMajor;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseMajorDTO {
    private Long id;
    private String name;
    private String description;
    private Long coordinatorId;
    private String coordinatorName;
    private CourseMajor.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

