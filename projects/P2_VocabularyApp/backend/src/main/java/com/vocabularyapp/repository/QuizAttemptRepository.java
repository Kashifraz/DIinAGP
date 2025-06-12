package com.vocabularyapp.repository;

import com.vocabularyapp.entity.QuizAttempt;
import com.vocabularyapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    List<QuizAttempt> findByUserOrderByDateAttemptedDesc(User user);
    
    List<QuizAttempt> findByUserAndHskLevelOrderByDateAttemptedDesc(User user, Integer hskLevel);
    
    List<QuizAttempt> findByUserAndQuizTypeOrderByDateAttemptedDesc(User user, QuizAttempt.QuizType quizType);
    
    @Query("SELECT q FROM QuizAttempt q WHERE q.user = :user AND q.dateAttempted >= :startDate ORDER BY q.dateAttempted DESC")
    List<QuizAttempt> findByUserAndDateAfter(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT AVG(q.score) FROM QuizAttempt q WHERE q.user = :user AND q.hskLevel = :hskLevel")
    Double findAverageScoreByUserAndHskLevel(@Param("user") User user, @Param("hskLevel") Integer hskLevel);
    
    @Query("SELECT COUNT(q) FROM QuizAttempt q WHERE q.user = :user AND q.hskLevel = :hskLevel")
    Long countByUserAndHskLevel(@Param("user") User user, @Param("hskLevel") Integer hskLevel);
}
