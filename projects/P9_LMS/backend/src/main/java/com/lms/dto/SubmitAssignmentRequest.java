package com.lms.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class SubmitAssignmentRequest {
    @NotNull(message = "File is required")
    private MultipartFile file;
}

