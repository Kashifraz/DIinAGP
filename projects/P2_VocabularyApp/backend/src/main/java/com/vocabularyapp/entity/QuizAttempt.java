package com.vocabularyapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    @Column(name = "hsk_level", nullable = false)
    private Integer hskLevel;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "quiz_type", nullable = false)
    private QuizType quizType;
    
    @NotNull
    @Column(nullable = false)
    private Integer score;
    
    @NotNull
    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;
    
    @CreationTimestamp
    @Column(name = "date_attempted", nullable = false, updatable = false)
    private LocalDateTime dateAttempted;
    
    public enum QuizType {
        EASY, MEDIUM, HARD
    }
    
    // Constructors
    public QuizAttempt() {}
    
    public QuizAttempt(User user, Integer hskLevel, QuizType quizType, Integer score, Integer totalQuestions) {
        this.user = user;
        this.hskLevel = hskLevel;
        this.quizType = quizType;
        this.score = score;
        this.totalQuestions = totalQuestions;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Integer getHskLevel() {
        return hskLevel;
    }
    
    public void setHskLevel(Integer hskLevel) {
        this.hskLevel = hskLevel;
    }
    
    public QuizType getQuizType() {
        return quizType;
    }
    
    public void setQuizType(QuizType quizType) {
        this.quizType = quizType;
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
    
    public LocalDateTime getDateAttempted() {
        return dateAttempted;
    }
    
    public void setDateAttempted(LocalDateTime dateAttempted) {
        this.dateAttempted = dateAttempted;
    }
}
