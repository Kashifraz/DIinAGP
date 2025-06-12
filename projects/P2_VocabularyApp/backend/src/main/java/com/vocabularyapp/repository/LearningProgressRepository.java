package com.vocabularyapp.repository;

import com.vocabularyapp.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    
    /**
     * Find learning progress by user ID and session ID
     */
    List<LearningProgress> findByUserIdAndSessionId(Long userId, Long sessionId);
    
    /**
     * Find learning progress by user ID and vocabulary ID
     */
    List<LearningProgress> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);
    
    /**
     * Find specific learning progress by user, vocabulary, and session
     */
    Optional<LearningProgress> findByUserIdAndVocabularyIdAndSessionId(
        Long userId, Long vocabularyId, Long sessionId);
    
    /**
     * Count learned words for a user in a specific session
     */
    @Query("SELECT COUNT(lp) FROM LearningProgress lp WHERE lp.userId = :userId AND lp.sessionId = :sessionId AND lp.isLearned = true")
    Long countLearnedWordsInSession(@Param("userId") Long userId, @Param("sessionId") Long sessionId);
    
    /**
     * Count total words in a session
     */
    @Query("SELECT COUNT(lp) FROM LearningProgress lp WHERE lp.userId = :userId AND lp.sessionId = :sessionId")
    Long countTotalWordsInSession(@Param("userId") Long userId, @Param("sessionId") Long sessionId);
    
    /**
     * Find all learned words for a user across all sessions
     */
    @Query("SELECT lp FROM LearningProgress lp WHERE lp.userId = :userId AND lp.isLearned = true ORDER BY lp.lastReviewedAt DESC")
    List<LearningProgress> findLearnedWordsByUser(@Param("userId") Long userId);
    
    /**
     * Find words that need review (not learned or not reviewed recently)
     */
    @Query("SELECT lp FROM LearningProgress lp WHERE lp.userId = :userId AND (lp.isLearned = false OR lp.lastReviewedAt IS NULL) ORDER BY lp.createdAt ASC")
    List<LearningProgress> findWordsNeedingReview(@Param("userId") Long userId);
    
    /**
     * Count learned words by HSK level for a user
     */
    @Query("SELECT COUNT(lp) FROM LearningProgress lp " +
           "JOIN lp.vocabulary v " +
           "WHERE lp.userId = :userId AND lp.isLearned = true AND v.hskLevel = :hskLevel")
    Long countLearnedWordsByHskLevel(@Param("userId") Long userId, @Param("hskLevel") Integer hskLevel);
}
