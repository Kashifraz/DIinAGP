package com.vocabularyapp.dto;

import com.vocabularyapp.entity.QuizAttempt;
import java.time.LocalDateTime;

public class QuizResultDto {
    private Long quizAttemptId;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private QuizAttempt.QuizType quizType;
    private Integer hskLevel;
    private String message;
    private LocalDateTime dateAttempted;
    
    public QuizResultDto() {}
    
    public QuizResultDto(Long quizAttemptId, Integer score, Integer totalQuestions, 
                        Double percentage, QuizAttempt.QuizType quizType, Integer hskLevel, String message, LocalDateTime dateAttempted) {
        this.quizAttemptId = quizAttemptId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.quizType = quizType;
        this.hskLevel = hskLevel;
        this.message = message;
        this.dateAttempted = dateAttempted;
    }
    
    // Getters and Setters
    public Long getQuizAttemptId() {
        return quizAttemptId;
    }
    
    public void setQuizAttemptId(Long quizAttemptId) {
        this.quizAttemptId = quizAttemptId;
    }
    
    public Integer getScore() {
        return score;
    }
    
    public void setScore(Integer score) {
        this.score = score;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public Double getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
    
    public QuizAttempt.QuizType getQuizType() {
        return quizType;
    }
    
    public void setQuizType(QuizAttempt.QuizType quizType) {
        this.quizType = quizType;
    }
    
    public Integer getHskLevel() {
        return hskLevel;
    }
    
    public void setHskLevel(Integer hskLevel) {
        this.hskLevel = hskLevel;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getDateAttempted() {
        return dateAttempted;
    }
    
    public void setDateAttempted(LocalDateTime dateAttempted) {
        this.dateAttempted = dateAttempted;
    }
}
