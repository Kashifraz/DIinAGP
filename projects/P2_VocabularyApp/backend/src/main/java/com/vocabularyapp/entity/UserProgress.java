package com.vocabularyapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "hsk_level"}))
public class UserProgress {
    
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
    
    @Column(name = "words_learned", nullable = false)
    private Integer wordsLearned = 0;
    
    @Column(name = "total_attempts", nullable = false)
    private Integer totalAttempts = 0;
    
    @Column(name = "average_score", precision = 5, scale = 2, nullable = false)
    private BigDecimal averageScore = BigDecimal.ZERO;
    
    @UpdateTimestamp
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;
    
    // Constructors
    public UserProgress() {}
    
    public UserProgress(User user, Integer hskLevel) {
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
    
    public Integer getWordsLearned() {
        return wordsLearned;
    }
    
    public void setWordsLearned(Integer wordsLearned) {
        this.wordsLearned = wordsLearned;
    }
    
    public Integer getTotalAttempts() {
        return totalAttempts;
    }
    
    public void setTotalAttempts(Integer totalAttempts) {
        this.totalAttempts = totalAttempts;
    }
    
    public BigDecimal getAverageScore() {
        return averageScore;
    }
    
    public void setAverageScore(BigDecimal averageScore) {
        this.averageScore = averageScore;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
