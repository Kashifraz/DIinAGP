package com.lms.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String message;
    private String details;
    private int status;
    private LocalDateTime timestamp;
    private Map<String, String> fieldErrors;
    private List<String> errors;
}

