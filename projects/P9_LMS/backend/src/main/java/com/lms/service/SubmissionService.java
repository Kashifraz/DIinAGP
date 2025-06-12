package com.lms.service;

import com.lms.dto.SubmissionDTO;
import com.lms.dto.SubmitAssignmentRequest;
import com.lms.dto.SubmitQuizRequest;
import com.lms.entity.Assessment;
import com.lms.entity.CourseEnrollment;
import com.lms.entity.Submission;
import com.lms.entity.User;
import com.lms.repository.AssessmentRepository;
import com.lms.repository.CourseEnrollmentRepository;
import com.lms.repository.SubmissionRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Transactional
    public SubmissionDTO submitAssignment(Long assessmentId, Long studentId, MultipartFile file) {
        // Validate assessment
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        if (assessment.getAssessmentType() != Assessment.AssessmentType.ASSIGNMENT) {
            throw new RuntimeException("Assessment is not an assignment");
        }

        if (assessment.getStatus() != Assessment.Status.PUBLISHED) {
            throw new RuntimeException("Assessment is not published");
        }

        // Validate student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        // Check enrollment
        CourseEnrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(assessment.getCourse().getId(), studentId)
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this course"));

        if (enrollment.getStatus() != CourseEnrollment.Status.ACTIVE) {
            throw new RuntimeException("Student enrollment is not active");
        }

        // Check deadline
        if (assessment.getDeadline() != null && LocalDateTime.now().isAfter(assessment.getDeadline())) {
            throw new RuntimeException("Assignment deadline has passed");
        }

        // Check if already submitted
        if (submissionRepository.existsByAssessmentIdAndStudentId(assessmentId, studentId)) {
            throw new RuntimeException("Assignment already submitted");
        }

        // Store file
        String filePath;
        try {
            filePath = fileStorageService.storeSubmissionFile(file, assessment.getCourse().getId(), assessmentId, studentId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }

        // Create submission
        Submission submission = new Submission();
        submission.setAssessment(assessment);
        submission.setStudent(student);
        submission.setSubmittedFilePath(filePath);
        submission.setSubmissionDate(LocalDateTime.now());
        submission.setStatus(Submission.Status.SUBMITTED);

        submission = submissionRepository.save(submission);
        return convertToDTO(submission);
    }

    @Transactional
    public SubmissionDTO submitQuiz(Long assessmentId, Long studentId, Map<String, String> answers) {
        // Validate assessment
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));

        if (assessment.getAssessmentType() != Assessment.AssessmentType.QUIZ) {
            throw new RuntimeException("Assessment is not a quiz");
        }

        if (assessment.getStatus() != Assessment.Status.PUBLISHED) {
            throw new RuntimeException("Assessment is not published");
        }

        // Validate student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        // Check enrollment
        CourseEnrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(assessment.getCourse().getId(), studentId)
                .orElseThrow(() -> new RuntimeException("Student is not enrolled in this course"));

        if (enrollment.getStatus() != CourseEnrollment.Status.ACTIVE) {
            throw new RuntimeException("Student enrollment is not active");
        }

        // Check if already submitted
        if (submissionRepository.existsByAssessmentIdAndStudentId(assessmentId, studentId)) {
            throw new RuntimeException("Quiz already submitted");
        }

        // Create submission
        Submission submission = new Submission();
        submission.setAssessment(assessment);
        submission.setStudent(student);
        submission.setSubmittedAnswers(answers);
        submission.setSubmissionDate(LocalDateTime.now());
        submission.setStatus(Submission.Status.SUBMITTED);

        submission = submissionRepository.save(submission);
        return convertToDTO(submission);
    }

    public List<SubmissionDTO> getSubmissionsByAssessment(Long assessmentId) {
        List<Submission> submissions = submissionRepository.findByAssessmentId(assessmentId);
        return submissions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SubmissionDTO getSubmissionById(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        return convertToDTO(submission);
    }

    public List<SubmissionDTO> getSubmissionsByStudent(Long studentId) {
        List<Submission> submissions = submissionRepository.findByStudentId(studentId);
        return submissions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public org.springframework.core.io.Resource downloadSubmissionFile(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (submission.getSubmittedFilePath() == null || submission.getSubmittedFilePath().isEmpty()) {
            throw new RuntimeException("No file available for this submission");
        }

        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get(submission.getSubmittedFilePath());
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found or not readable: " + submission.getSubmittedFilePath());
            }

            return resource;
        } catch (java.net.MalformedURLException e) {
            throw new RuntimeException("File not found: " + submission.getSubmittedFilePath(), e);
        }
    }

    private SubmissionDTO convertToDTO(Submission submission) {
        SubmissionDTO dto = new SubmissionDTO();
        dto.setId(submission.getId());
        dto.setAssessmentId(submission.getAssessment().getId());
        dto.setAssessmentTitle(submission.getAssessment().getTitle());
        dto.setAssessmentType(submission.getAssessment().getAssessmentType().name());
        dto.setStudentId(submission.getStudent().getId());
        dto.setStudentName(submission.getStudent().getFirstName() + " " + submission.getStudent().getLastName());
        dto.setStudentEmail(submission.getStudent().getEmail());
        dto.setSubmittedFilePath(submission.getSubmittedFilePath());
        dto.setSubmittedAnswers(submission.getSubmittedAnswers());
        dto.setSubmissionDate(submission.getSubmissionDate());
        dto.setStatus(submission.getStatus());
        
        if (submission.getGrade() != null) {
            dto.setGradeId(submission.getGrade().getId());
            dto.setMarksObtained(submission.getGrade().getMarksObtained());
            dto.setFeedback(submission.getGrade().getFeedback());
        }
        
        dto.setCreatedAt(submission.getCreatedAt());
        dto.setUpdatedAt(submission.getUpdatedAt());
        return dto;
    }
}

