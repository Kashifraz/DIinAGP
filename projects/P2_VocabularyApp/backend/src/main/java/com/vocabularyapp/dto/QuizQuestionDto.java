package com.vocabularyapp.dto;

import com.vocabularyapp.entity.QuizAttempt;

public class QuizQuestionDto {
    private Long questionId;
    private String chineseCharacter;
    private String pinyin;
    private String correctAnswer;
    private String[] options;
    private Integer questionNumber;
    private Integer totalQuestions;
    private QuizAttempt.QuizType quizType;
    
    public QuizQuestionDto() {}
    
    public QuizQuestionDto(Long questionId, String chineseCharacter, String pinyin, 
                         String correctAnswer, String[] options, Integer questionNumber, 
                         Integer totalQuestions, QuizAttempt.QuizType quizType) {
        this.questionId = questionId;
        this.chineseCharacter = chineseCharacter;
        this.pinyin = pinyin;
        this.correctAnswer = correctAnswer;
        this.options = options;
        this.questionNumber = questionNumber;
        this.totalQuestions = totalQuestions;
        this.quizType = quizType;
    }
    
    // Getters and Setters
    public Long getQuestionId() {
        return questionId;
    }
    
    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }
    
    public String getChineseCharacter() {
        return chineseCharacter;
    }
    
    public void setChineseCharacter(String chineseCharacter) {
        this.chineseCharacter = chineseCharacter;
    }
    
    public String getPinyin() {
        return pinyin;
    }
    
    public void setPinyin(String pinyin) {
        this.pinyin = pinyin;
    }
    
    public String getCorrectAnswer() {
        return correctAnswer;
    }
    
    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
    
    public String[] getOptions() {
        return options;
    }
    
    public void setOptions(String[] options) {
        this.options = options;
    }
    
    public Integer getQuestionNumber() {
        return questionNumber;
    }
    
    public void setQuestionNumber(Integer questionNumber) {
        this.questionNumber = questionNumber;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public QuizAttempt.QuizType getQuizType() {
        return quizType;
    }
    
    public void setQuizType(QuizAttempt.QuizType quizType) {
        this.quizType = quizType;
    }
}
