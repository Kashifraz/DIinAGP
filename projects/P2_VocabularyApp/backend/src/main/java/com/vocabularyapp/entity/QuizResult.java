package com.vocabularyapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "quiz_results")
public class QuizResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_attempt_id", nullable = false)
    private QuizAttempt quizAttempt;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_word_id", nullable = false)
    private HskVocabulary questionWord;
    
    @Column(name = "user_answer")
    private String userAnswer;
    
    @NotNull
    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;
    
    // Constructors
    public QuizResult() {}
    
    public QuizResult(QuizAttempt quizAttempt, HskVocabulary questionWord, String userAnswer, Boolean isCorrect) {
        this.quizAttempt = quizAttempt;
        this.questionWord = questionWord;
        this.userAnswer = userAnswer;
        this.isCorrect = isCorrect;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public QuizAttempt getQuizAttempt() {
        return quizAttempt;
    }
    
    public void setQuizAttempt(QuizAttempt quizAttempt) {
        this.quizAttempt = quizAttempt;
    }
    
    public HskVocabulary getQuestionWord() {
        return questionWord;
    }
    
    public void setQuestionWord(HskVocabulary questionWord) {
        this.questionWord = questionWord;
    }
    
    public String getUserAnswer() {
        return userAnswer;
    }
    
    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }
    
    public Boolean getIsCorrect() {
        return isCorrect;
    }
    
    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}
