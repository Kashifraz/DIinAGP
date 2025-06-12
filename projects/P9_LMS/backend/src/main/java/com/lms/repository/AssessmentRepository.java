package com.lms.repository;

import com.lms.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByCourseId(Long courseId);
    List<Assessment> findByCourseIdAndStatus(Long courseId, Assessment.Status status);
    List<Assessment> findByProfessorId(Long professorId);
    List<Assessment> findByCourseIdAndAssessmentType(Long courseId, Assessment.AssessmentType assessmentType);
    Optional<Assessment> findByIdAndProfessorId(Long id, Long professorId);
}

