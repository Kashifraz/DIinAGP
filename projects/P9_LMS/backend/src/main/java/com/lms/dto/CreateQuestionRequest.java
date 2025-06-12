package com.lms.dto;

import com.lms.entity.QuizQuestion;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateQuestionRequest {
    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuizQuestion.QuestionType questionType;

    private List<String> options;

    @NotBlank(message = "Correct answer is required")
    private String correctAnswer;

    @NotNull(message = "Points is required")
    @DecimalMin(value = "0.01", message = "Points must be greater than 0")
    private BigDecimal points;

    @Min(value = 0, message = "Display order must be non-negative")
    private Integer displayOrder = 0;
}

