package com.vocabularyapp.repository;

import com.vocabularyapp.entity.QuizAttempt;
import com.vocabularyapp.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    
    List<QuizResult> findByQuizAttempt(QuizAttempt quizAttempt);
    
    List<QuizResult> findByQuizAttemptAndIsCorrect(QuizAttempt quizAttempt, Boolean isCorrect);
}
