package com.lms.service;

import com.lms.dto.CourseGradeDTO;
import com.lms.dto.GradeDTO;
import com.lms.dto.GradeRequest;
import com.lms.dto.UpdateGradeRequest;
import com.lms.entity.*;
import com.lms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GradeService {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private CourseGradeRepository courseGradeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public GradeDTO gradeSubmission(Long submissionId, Long professorId, GradeRequest request) {
        // Get submission
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Validate professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found"));

        if (professor.getRole() != User.Role.PROFESSOR) {
            throw new RuntimeException("User is not a professor");
        }

        // Validate assessment belongs to professor
        Assessment assessment = submission.getAssessment();
        if (!assessment.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("Assessment does not belong to this professor");
        }

        // Validate marks
        if (request.getMarksObtained().compareTo(assessment.getMaximumMarks()) > 0) {
            throw new RuntimeException("Marks obtained cannot exceed maximum marks");
        }

        // Check if grade already exists
        Optional<Grade> existingGrade = gradeRepository.findBySubmissionId(submissionId);
        Grade grade;
        
        if (existingGrade.isPresent()) {
            grade = existingGrade.get();
            grade.setMarksObtained(request.getMarksObtained());
            grade.setFeedback(request.getFeedback());
            grade.setGradedAt(LocalDateTime.now());
        } else {
            grade = new Grade();
            grade.setSubmission(submission);
            grade.setAssessment(assessment);
            grade.setStudent(submission.getStudent());
            grade.setCourse(assessment.getCourse());
            grade.setMarksObtained(request.getMarksObtained());
            grade.setFeedback(request.getFeedback());
            grade.setGradedBy(professor);
            grade.setGradedAt(LocalDateTime.now());
        }

        grade = gradeRepository.save(grade);

        // Update submission status
        submission.setStatus(Submission.Status.GRADED);
        submissionRepository.save(submission);

        // Calculate course grade
        calculateCourseGrade(assessment.getCourse().getId(), submission.getStudent().getId());

        return convertToDTO(grade);
    }

    @Transactional
    public GradeDTO updateGrade(Long gradeId, Long professorId, UpdateGradeRequest request) {
        // Get grade
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new RuntimeException("Grade not found"));

        // Validate professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found"));

        if (professor.getRole() != User.Role.PROFESSOR) {
            throw new RuntimeException("User is not a professor");
        }

        // Validate assessment belongs to professor
        if (!grade.getAssessment().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("Grade does not belong to this professor");
        }

        // Validate marks
        if (request.getMarksObtained().compareTo(grade.getAssessment().getMaximumMarks()) > 0) {
            throw new RuntimeException("Marks obtained cannot exceed maximum marks");
        }

        grade.setMarksObtained(request.getMarksObtained());
        grade.setFeedback(request.getFeedback());
        grade.setGradedAt(LocalDateTime.now());

        grade = gradeRepository.save(grade);

        // Recalculate course grade
        calculateCourseGrade(grade.getCourse().getId(), grade.getStudent().getId());

        return convertToDTO(grade);
    }

    public List<GradeDTO> getGradesByAssessment(Long assessmentId) {
        List<Grade> grades = gradeRepository.findByAssessmentId(assessmentId);
        return grades.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GradeDTO> getGradesByStudent(Long studentId) {
        List<Grade> grades = gradeRepository.findByStudentId(studentId);
        return grades.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GradeDTO> getGradesByCourseAndStudent(Long courseId, Long studentId) {
        List<Grade> grades = gradeRepository.findByCourseIdAndStudentId(courseId, studentId);
        return grades.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GradeDTO> getGradesByCourse(Long courseId) {
        List<Grade> grades = gradeRepository.findByCourseId(courseId);
        return grades.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseGradeDTO calculateCourseGrade(Long courseId, Long studentId) {
        // Get all grades for this course and student
        List<Grade> grades = gradeRepository.findByCourseIdAndStudentId(courseId, studentId);

        if (grades.isEmpty()) {
            throw new RuntimeException("No grades found for this course and student");
        }

        // Calculate weighted average
        BigDecimal totalWeightedMarks = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (Grade grade : grades) {
            Assessment assessment = grade.getAssessment();
            BigDecimal weight = assessment.getWeightPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            BigDecimal percentage = grade.getMarksObtained()
                    .divide(assessment.getMaximumMarks(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            BigDecimal weightedMarks = percentage.multiply(weight);

            totalWeightedMarks = totalWeightedMarks.add(weightedMarks);
            totalWeight = totalWeight.add(weight);
        }

        BigDecimal overallGrade = totalWeight.compareTo(BigDecimal.ZERO) > 0
                ? totalWeightedMarks.divide(totalWeight, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Determine grade letter
        CourseGrade.GradeLetter gradeLetter = determineGradeLetter(overallGrade);

        // Save or update course grade
        Optional<CourseGrade> existingCourseGrade = courseGradeRepository.findByCourseIdAndStudentId(courseId, studentId);
        CourseGrade courseGrade;

        if (existingCourseGrade.isPresent()) {
            courseGrade = existingCourseGrade.get();
            courseGrade.setOverallGrade(overallGrade);
            courseGrade.setGradeLetter(gradeLetter);
            courseGrade.setLastCalculatedAt(LocalDateTime.now());
        } else {
            courseGrade = new CourseGrade();
            courseGrade.setCourse(grades.get(0).getCourse());
            courseGrade.setStudent(grades.get(0).getStudent());
            courseGrade.setOverallGrade(overallGrade);
            courseGrade.setGradeLetter(gradeLetter);
            courseGrade.setLastCalculatedAt(LocalDateTime.now());
        }

        courseGrade = courseGradeRepository.save(courseGrade);
        return convertToDTO(courseGrade);
    }

    public CourseGradeDTO getCourseGrade(Long courseId, Long studentId) {
        CourseGrade courseGrade = courseGradeRepository.findByCourseIdAndStudentId(courseId, studentId)
                .orElseThrow(() -> new RuntimeException("Course grade not found"));
        return convertToDTO(courseGrade);
    }

    private CourseGrade.GradeLetter determineGradeLetter(BigDecimal overallGrade) {
        if (overallGrade.compareTo(BigDecimal.valueOf(90)) >= 0) {
            return CourseGrade.GradeLetter.A;
        } else if (overallGrade.compareTo(BigDecimal.valueOf(80)) >= 0) {
            return CourseGrade.GradeLetter.B;
        } else if (overallGrade.compareTo(BigDecimal.valueOf(70)) >= 0) {
            return CourseGrade.GradeLetter.C;
        } else if (overallGrade.compareTo(BigDecimal.valueOf(60)) >= 0) {
            return CourseGrade.GradeLetter.D;
        } else {
            return CourseGrade.GradeLetter.F;
        }
    }

    private GradeDTO convertToDTO(Grade grade) {
        GradeDTO dto = new GradeDTO();
        dto.setId(grade.getId());
        dto.setSubmissionId(grade.getSubmission().getId());
        dto.setAssessmentId(grade.getAssessment().getId());
        dto.setAssessmentTitle(grade.getAssessment().getTitle());
        dto.setStudentId(grade.getStudent().getId());
        dto.setStudentName(grade.getStudent().getFirstName() + " " + grade.getStudent().getLastName());
        dto.setStudentEmail(grade.getStudent().getEmail());
        dto.setCourseId(grade.getCourse().getId());
        dto.setCourseName(grade.getCourse().getName());
        dto.setCourseCode(grade.getCourse().getCode());
        dto.setMarksObtained(grade.getMarksObtained());
        dto.setMaximumMarks(grade.getAssessment().getMaximumMarks());
        dto.setWeightPercentage(grade.getAssessment().getWeightPercentage());
        dto.setFeedback(grade.getFeedback());
        dto.setGradedById(grade.getGradedBy().getId());
        dto.setGradedByName(grade.getGradedBy().getFirstName() + " " + grade.getGradedBy().getLastName());
        dto.setGradedAt(grade.getGradedAt());
        dto.setCreatedAt(grade.getCreatedAt());
        dto.setUpdatedAt(grade.getUpdatedAt());
        return dto;
    }

    private CourseGradeDTO convertToDTO(CourseGrade courseGrade) {
        CourseGradeDTO dto = new CourseGradeDTO();
        dto.setId(courseGrade.getId());
        dto.setCourseId(courseGrade.getCourse().getId());
        dto.setCourseName(courseGrade.getCourse().getName());
        dto.setCourseCode(courseGrade.getCourse().getCode());
        dto.setStudentId(courseGrade.getStudent().getId());
        dto.setStudentName(courseGrade.getStudent().getFirstName() + " " + courseGrade.getStudent().getLastName());
        dto.setStudentEmail(courseGrade.getStudent().getEmail());
        dto.setOverallGrade(courseGrade.getOverallGrade());
        dto.setGradeLetter(courseGrade.getGradeLetter());
        dto.setLastCalculatedAt(courseGrade.getLastCalculatedAt());
        dto.setCreatedAt(courseGrade.getCreatedAt());
        dto.setUpdatedAt(courseGrade.getUpdatedAt());
        return dto;
    }
}

