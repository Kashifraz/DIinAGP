package com.lms.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReorderQuestionsRequest {
    @NotEmpty(message = "Question IDs list cannot be empty")
    private List<Long> questionIds;
}

