package com.lms.repository;

import com.lms.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByAssessmentIdOrderByDisplayOrderAsc(Long assessmentId);
    Optional<QuizQuestion> findByIdAndAssessmentId(Long id, Long assessmentId);
    
    @Query("SELECT COUNT(q) FROM QuizQuestion q WHERE q.assessment.id = :assessmentId")
    long countByAssessmentId(@Param("assessmentId") Long assessmentId);
}

