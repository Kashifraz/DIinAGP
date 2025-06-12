package com.lms.service;

import com.lms.dto.CreateQuestionRequest;
import com.lms.dto.QuizQuestionDTO;
import com.lms.dto.UpdateQuestionRequest;
import com.lms.entity.Assessment;
import com.lms.entity.QuizQuestion;
import com.lms.repository.AssessmentRepository;
import com.lms.repository.QuizQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizQuestionService {

    private final QuizQuestionRepository questionRepository;
    private final AssessmentRepository assessmentRepository;

    @Transactional
    public QuizQuestionDTO addQuestion(Long assessmentId, CreateQuestionRequest request, Long professorId) {
        // Get assessment
        Assessment assessment = assessmentRepository.findByIdAndProfessorId(assessmentId, professorId)
                .orElseThrow(() -> new RuntimeException("Assessment not found or you don't have permission to add questions"));

        // Verify it's a quiz
        if (assessment.getAssessmentType() != Assessment.AssessmentType.QUIZ) {
            throw new RuntimeException("Questions can only be added to quizzes");
        }

        // Validate question type specific requirements
        if (request.getQuestionType() == QuizQuestion.QuestionType.MULTIPLE_CHOICE) {
            if (request.getOptions() == null || request.getOptions().size() < 2) {
                throw new RuntimeException("Multiple choice questions must have at least 2 options");
            }
            if (!request.getOptions().contains(request.getCorrectAnswer())) {
                throw new RuntimeException("Correct answer must be one of the options");
            }
        }

        // Get next display order
        long questionCount = questionRepository.countByAssessmentId(assessmentId);
        int displayOrder = request.getDisplayOrder() != null ? request.getDisplayOrder() : (int) questionCount;

        // Create question
        QuizQuestion question = new QuizQuestion();
        question.setAssessment(assessment);
        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(request.getQuestionType());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setPoints(request.getPoints());
        question.setDisplayOrder(displayOrder);

        question = questionRepository.save(question);
        return convertToDTO(question);
    }

    public List<QuizQuestionDTO> getQuestionsByAssessment(Long assessmentId) {
        List<QuizQuestion> questions = questionRepository.findByAssessmentIdOrderByDisplayOrderAsc(assessmentId);
        return questions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public QuizQuestionDTO getQuestionById(Long id) {
        QuizQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        return convertToDTO(question);
    }

    @Transactional
    public QuizQuestionDTO updateQuestion(Long id, UpdateQuestionRequest request, Long professorId) {
        QuizQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        // Verify professor owns the assessment
        if (!question.getAssessment().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to update this question");
        }

        // Validate question type specific requirements
        if (request.getQuestionType() == QuizQuestion.QuestionType.MULTIPLE_CHOICE) {
            if (request.getOptions() == null || request.getOptions().size() < 2) {
                throw new RuntimeException("Multiple choice questions must have at least 2 options");
            }
            if (!request.getOptions().contains(request.getCorrectAnswer())) {
                throw new RuntimeException("Correct answer must be one of the options");
            }
        }

        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(request.getQuestionType());
        question.setOptions(request.getOptions());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setPoints(request.getPoints());
        if (request.getDisplayOrder() != null) {
            question.setDisplayOrder(request.getDisplayOrder());
        }

        question = questionRepository.save(question);
        return convertToDTO(question);
    }

    @Transactional
    public void deleteQuestion(Long id, Long professorId) {
        QuizQuestion question = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));

        // Verify professor owns the assessment
        if (!question.getAssessment().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to delete this question");
        }

        // Only allow deletion if assessment is in DRAFT status
        if (question.getAssessment().getStatus() != Assessment.Status.DRAFT) {
            throw new RuntimeException("Questions can only be deleted from draft assessments");
        }

        questionRepository.delete(question);
    }

    @Transactional
    public void reorderQuestions(Long assessmentId, List<Long> questionIds, Long professorId) {
        // Get assessment
        Assessment assessment = assessmentRepository.findByIdAndProfessorId(assessmentId, professorId)
                .orElseThrow(() -> new RuntimeException("Assessment not found or you don't have permission to reorder questions"));

        // Update display order
        for (int i = 0; i < questionIds.size(); i++) {
            final int orderIndex = i;
            final Long questionId = questionIds.get(i);
            QuizQuestion question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
            
            // Verify question belongs to this assessment
            if (!question.getAssessment().getId().equals(assessmentId)) {
                throw new RuntimeException("Question does not belong to this assessment");
            }
            
            question.setDisplayOrder(orderIndex);
            questionRepository.save(question);
        }
    }

    private QuizQuestionDTO convertToDTO(QuizQuestion question) {
        QuizQuestionDTO dto = new QuizQuestionDTO();
        dto.setId(question.getId());
        dto.setAssessmentId(question.getAssessment().getId());
        dto.setQuestionText(question.getQuestionText());
        dto.setQuestionType(question.getQuestionType());
        dto.setOptions(question.getOptions());
        dto.setCorrectAnswer(question.getCorrectAnswer());
        dto.setPoints(question.getPoints());
        dto.setDisplayOrder(question.getDisplayOrder());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setUpdatedAt(question.getUpdatedAt());
        return dto;
    }
}

