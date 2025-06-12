package com.lms.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Map;

@Data
public class SubmitQuizRequest {
    @NotEmpty(message = "Answers are required")
    private Map<String, String> answers;
}

