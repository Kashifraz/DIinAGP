package com.lms.repository;

import com.lms.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findBySubmissionId(Long submissionId);
    List<Grade> findByAssessmentId(Long assessmentId);
    List<Grade> findByStudentId(Long studentId);
    List<Grade> findByCourseId(Long courseId);
    List<Grade> findByCourseIdAndStudentId(Long courseId, Long studentId);
    Optional<Grade> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);
}

