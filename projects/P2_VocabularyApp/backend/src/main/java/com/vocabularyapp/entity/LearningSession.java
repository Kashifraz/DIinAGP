package com.vocabularyapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_sessions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LearningSession {
    
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
    @Column(name = "current_word_index", nullable = false)
    private Integer currentWordIndex = 0;
    
    @NotNull
    @Column(name = "words_per_session", nullable = false)
    private Integer wordsPerSession = 10;
    
    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public LearningSession() {}
    
    public LearningSession(User user, Integer hskLevel) {
        this.user = user;
        this.hskLevel = hskLevel;
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
    
    public Integer getCurrentWordIndex() {
        return currentWordIndex;
    }
    
    public void setCurrentWordIndex(Integer currentWordIndex) {
        this.currentWordIndex = currentWordIndex;
    }
    
    public Integer getWordsPerSession() {
        return wordsPerSession;
    }
    
    public void setWordsPerSession(Integer wordsPerSession) {
        this.wordsPerSession = wordsPerSession;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
