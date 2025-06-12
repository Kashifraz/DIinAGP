package com.vocabularyapp.repository;

import com.vocabularyapp.entity.LearningSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    
    /**
     * Find active learning session for a user and HSK level
     */
    @Query("SELECT ls FROM LearningSession ls WHERE ls.user.id = :userId AND ls.hskLevel = :hskLevel AND ls.isCompleted = false ORDER BY ls.createdAt DESC")
    Optional<LearningSession> findActiveSessionByUserAndLevel(@Param("userId") Long userId, @Param("hskLevel") Integer hskLevel);
    
    /**
     * Find all sessions for a user
     */
    List<LearningSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find sessions by user and HSK level
     */
    List<LearningSession> findByUserIdAndHskLevelOrderByCreatedAtDesc(Long userId, Integer hskLevel);
    
    /**
     * Find completed sessions for a user
     */
    List<LearningSession> findByUserIdAndIsCompletedTrueOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find active sessions for a user
     */
    List<LearningSession> findByUserIdAndIsCompletedFalseOrderByCreatedAtDesc(Long userId);
    
    /**
     * Count completed sessions for a user by HSK level
     */
    @Query("SELECT COUNT(ls) FROM LearningSession ls WHERE ls.user.id = :userId AND ls.hskLevel = :hskLevel AND ls.isCompleted = true")
    Long countCompletedSessionsByUserAndLevel(@Param("userId") Long userId, @Param("hskLevel") Integer hskLevel);
    
    /**
     * Find the latest session for a user and HSK level
     */
    @Query("SELECT ls FROM LearningSession ls WHERE ls.user.id = :userId AND ls.hskLevel = :hskLevel ORDER BY ls.createdAt DESC")
    List<LearningSession> findLatestSessionsByUserAndLevel(@Param("userId") Long userId, @Param("hskLevel") Integer hskLevel);
}