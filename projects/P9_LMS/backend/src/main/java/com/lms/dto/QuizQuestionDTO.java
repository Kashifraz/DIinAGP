package com.lms.dto;

import com.lms.entity.QuizQuestion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDTO {
    private Long id;
    private Long assessmentId;
    private String questionText;
    private QuizQuestion.QuestionType questionType;
    private List<String> options;
    private String correctAnswer;
    private BigDecimal points;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

