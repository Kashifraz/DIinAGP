package com.lms.repository;

import com.lms.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssessmentId(Long assessmentId);
    List<Submission> findByStudentId(Long studentId);
    Optional<Submission> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);
    List<Submission> findByAssessmentIdAndStatus(Long assessmentId, Submission.Status status);
    List<Submission> findByStudentIdAndStatus(Long studentId, Submission.Status status);
    boolean existsByAssessmentIdAndStudentId(Long assessmentId, Long studentId);
}

