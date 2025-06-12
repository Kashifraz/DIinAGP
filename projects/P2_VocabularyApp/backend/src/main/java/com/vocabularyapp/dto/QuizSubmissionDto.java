package com.vocabularyapp.dto;

import com.vocabularyapp.entity.QuizAttempt;

public class QuizSubmissionDto {
    private Long quizAttemptId;
    private String userAnswer;
    private Integer questionNumber;
    private QuizAttempt.QuizType quizType;
    
    public QuizSubmissionDto() {}
    
    public QuizSubmissionDto(Long quizAttemptId, String userAnswer, Integer questionNumber, QuizAttempt.QuizType quizType) {
        this.quizAttemptId = quizAttemptId;
        this.userAnswer = userAnswer;
        this.questionNumber = questionNumber;
        this.quizType = quizType;
    }
    
    // Getters and Setters
    public Long getQuizAttemptId() {
        return quizAttemptId;
    }
    
    public void setQuizAttemptId(Long quizAttemptId) {
        this.quizAttemptId = quizAttemptId;
    }
    
    public String getUserAnswer() {
        return userAnswer;
    }
    
    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }
    
    public Integer getQuestionNumber() {
        return questionNumber;
    }
    
    public void setQuestionNumber(Integer questionNumber) {
        this.questionNumber = questionNumber;
    }
    
    public QuizAttempt.QuizType getQuizType() {
        return quizType;
    }
    
    public void setQuizType(QuizAttempt.QuizType quizType) {
        this.quizType = quizType;
    }
}
