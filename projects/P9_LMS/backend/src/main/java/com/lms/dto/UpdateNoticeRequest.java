package com.lms.dto;

import com.lms.entity.Notice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNoticeRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    @NotNull(message = "Category is required")
    private Notice.Category category;
    
    @NotNull(message = "Priority is required")
    private Notice.Priority priority;
    
    private LocalDateTime expirationDate;
}

