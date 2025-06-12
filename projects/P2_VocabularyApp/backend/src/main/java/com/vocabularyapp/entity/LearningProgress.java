package com.vocabularyapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "learning_progress", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "vocabulary_id", "session_id"}))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LearningProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @NotNull
    @Column(name = "vocabulary_id", nullable = false)
    private Long vocabularyId;
    
    @NotNull
    @Column(name = "session_id", nullable = false)
    private Long sessionId;
    
    @Column(name = "is_learned", nullable = false)
    private Boolean isLearned = false;
    
    @Column(name = "times_reviewed", nullable = false)
    private Integer timesReviewed = 0;
    
    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id", insertable = false, updatable = false)
    private HskVocabulary vocabulary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private LearningSession learningSession;
    
    // Constructors
    public LearningProgress() {}
    
    public LearningProgress(Long userId, Long vocabularyId, Long sessionId) {
        this.userId = userId;
        this.vocabularyId = vocabularyId;
        this.sessionId = sessionId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getVocabularyId() {
        return vocabularyId;
    }
    
    public void setVocabularyId(Long vocabularyId) {
        this.vocabularyId = vocabularyId;
    }
    
    public Long getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }
    
    public Boolean getIsLearned() {
        return isLearned;
    }
    
    public void setIsLearned(Boolean isLearned) {
        this.isLearned = isLearned;
    }
    
    public Integer getTimesReviewed() {
        return timesReviewed;
    }
    
    public void setTimesReviewed(Integer timesReviewed) {
        this.timesReviewed = timesReviewed;
    }
    
    public LocalDateTime getLastReviewedAt() {
        return lastReviewedAt;
    }
    
    public void setLastReviewedAt(LocalDateTime lastReviewedAt) {
        this.lastReviewedAt = lastReviewedAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public HskVocabulary getVocabulary() {
        return vocabulary;
    }
    
    public void setVocabulary(HskVocabulary vocabulary) {
        this.vocabulary = vocabulary;
    }
    
    public LearningSession getLearningSession() {
        return learningSession;
    }
    
    public void setLearningSession(LearningSession learningSession) {
        this.learningSession = learningSession;
    }
}
