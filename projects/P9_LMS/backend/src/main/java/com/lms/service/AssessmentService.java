package com.lms.service;

import com.lms.dto.AssessmentDTO;
import com.lms.dto.CreateAssessmentRequest;
import com.lms.dto.UpdateAssessmentRequest;
import com.lms.entity.Assessment;
import com.lms.entity.Course;
import com.lms.entity.User;
import com.lms.repository.AssessmentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public AssessmentDTO createAssessment(Long courseId, CreateAssessmentRequest request, Long professorId) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Verify professor is assigned to this course
        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to create assessments for this course");
        }

        // Get professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + professorId));

        // Validate assessment type specific requirements
        if (request.getAssessmentType() == Assessment.AssessmentType.ASSIGNMENT && request.getDeadline() == null) {
            throw new RuntimeException("Deadline is required for assignments");
        }
        if (request.getAssessmentType() == Assessment.AssessmentType.QUIZ && request.getTimeLimitMinutes() == null) {
            throw new RuntimeException("Time limit is required for quizzes");
        }

        // Create assessment
        Assessment assessment = new Assessment();
        assessment.setCourse(course);
        assessment.setProfessor(professor);
        assessment.setTitle(request.getTitle());
        assessment.setDescription(request.getDescription());
        assessment.setAssessmentType(request.getAssessmentType());
        assessment.setWeightPercentage(request.getWeightPercentage());
        assessment.setMaximumMarks(request.getMaximumMarks());
        assessment.setDeadline(request.getDeadline());
        assessment.setTimeLimitMinutes(request.getTimeLimitMinutes());
        assessment.setStatus(Assessment.Status.DRAFT);

        assessment = assessmentRepository.save(assessment);
        return convertToDTO(assessment);
    }

    public List<AssessmentDTO> getAssessmentsByCourse(Long courseId) {
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        return assessments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AssessmentDTO getAssessmentById(Long id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + id));
        return convertToDTO(assessment);
    }

    @Transactional
    public AssessmentDTO updateAssessment(Long id, UpdateAssessmentRequest request, Long professorId) {
        Assessment assessment = assessmentRepository.findByIdAndProfessorId(id, professorId)
                .orElseThrow(() -> new RuntimeException("Assessment not found or you don't have permission to update it"));

        // Validate assessment type specific requirements
        if (assessment.getAssessmentType() == Assessment.AssessmentType.ASSIGNMENT && request.getDeadline() == null && assessment.getDeadline() == null) {
            throw new RuntimeException("Deadline is required for assignments");
        }
        if (assessment.getAssessmentType() == Assessment.AssessmentType.QUIZ && request.getTimeLimitMinutes() == null && assessment.getTimeLimitMinutes() == null) {
            throw new RuntimeException("Time limit is required for quizzes");
        }

        assessment.setTitle(request.getTitle());
        assessment.setDescription(request.getDescription());
        assessment.setWeightPercentage(request.getWeightPercentage());
        assessment.setMaximumMarks(request.getMaximumMarks());
        assessment.setDeadline(request.getDeadline());
        assessment.setTimeLimitMinutes(request.getTimeLimitMinutes());
        if (request.getStatus() != null) {
            assessment.setStatus(request.getStatus());
        }

        assessment = assessmentRepository.save(assessment);
        return convertToDTO(assessment);
    }

    @Transactional
    public void deleteAssessment(Long id, Long professorId) {
        Assessment assessment = assessmentRepository.findByIdAndProfessorId(id, professorId)
                .orElseThrow(() -> new RuntimeException("Assessment not found or you don't have permission to delete it"));
        
        // Only allow deletion of DRAFT assessments
        if (assessment.getStatus() != Assessment.Status.DRAFT) {
            throw new RuntimeException("Only draft assessments can be deleted");
        }
        
        assessmentRepository.delete(assessment);
    }

    @Transactional
    public AssessmentDTO publishAssessment(Long id, Long professorId) {
        Assessment assessment = assessmentRepository.findByIdAndProfessorId(id, professorId)
                .orElseThrow(() -> new RuntimeException("Assessment not found or you don't have permission to publish it"));

        if (assessment.getStatus() != Assessment.Status.DRAFT) {
            throw new RuntimeException("Only draft assessments can be published");
        }

        // Validate quiz has questions
        if (assessment.getAssessmentType() == Assessment.AssessmentType.QUIZ && 
            (assessment.getQuestions() == null || assessment.getQuestions().isEmpty())) {
            throw new RuntimeException("Quiz must have at least one question before publishing");
        }

        assessment.setStatus(Assessment.Status.PUBLISHED);
        assessment = assessmentRepository.save(assessment);
        return convertToDTO(assessment);
    }

    @Transactional
    public AssessmentDTO closeAssessment(Long id, Long professorId) {
        Assessment assessment = assessmentRepository.findByIdAndProfessorId(id, professorId)
                .orElseThrow(() -> new RuntimeException("Assessment not found or you don't have permission to close it"));

        if (assessment.getStatus() != Assessment.Status.PUBLISHED) {
            throw new RuntimeException("Only published assessments can be closed");
        }

        assessment.setStatus(Assessment.Status.CLOSED);
        assessment = assessmentRepository.save(assessment);
        return convertToDTO(assessment);
    }

    public BigDecimal validateWeights(Long courseId) {
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        BigDecimal totalWeight = assessments.stream()
                .map(Assessment::getWeightPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return totalWeight;
    }

    private AssessmentDTO convertToDTO(Assessment assessment) {
        AssessmentDTO dto = new AssessmentDTO();
        dto.setId(assessment.getId());
        dto.setCourseId(assessment.getCourse().getId());
        dto.setCourseName(assessment.getCourse().getName());
        dto.setCourseCode(assessment.getCourse().getCode());
        dto.setProfessorId(assessment.getProfessor().getId());
        dto.setProfessorName(assessment.getProfessor().getFirstName() + " " + assessment.getProfessor().getLastName());
        dto.setTitle(assessment.getTitle());
        dto.setDescription(assessment.getDescription());
        dto.setAssessmentType(assessment.getAssessmentType());
        dto.setWeightPercentage(assessment.getWeightPercentage());
        dto.setMaximumMarks(assessment.getMaximumMarks());
        dto.setDeadline(assessment.getDeadline());
        dto.setTimeLimitMinutes(assessment.getTimeLimitMinutes());
        dto.setStatus(assessment.getStatus());
        dto.setCreatedAt(assessment.getCreatedAt());
        dto.setUpdatedAt(assessment.getUpdatedAt());
        return dto;
    }
}

