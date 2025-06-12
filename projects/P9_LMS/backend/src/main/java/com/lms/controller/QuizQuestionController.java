package com.lms.controller;

import com.lms.dto.CreateQuestionRequest;
import com.lms.dto.QuizQuestionDTO;
import com.lms.dto.ReorderQuestionsRequest;
import com.lms.dto.UpdateQuestionRequest;
import com.lms.repository.UserRepository;
import com.lms.service.QuizQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QuizQuestionController {

    private final QuizQuestionService questionService;
    private final UserRepository userRepository;

    @PostMapping("/assessment/{assessmentId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<QuizQuestionDTO> addQuestion(
            @PathVariable Long assessmentId,
            @Valid @RequestBody CreateQuestionRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        QuizQuestionDTO question = questionService.addQuestion(assessmentId, request, professorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(question);
    }

    @GetMapping("/assessment/{assessmentId}")
    public ResponseEntity<List<QuizQuestionDTO>> getQuestionsByAssessment(@PathVariable Long assessmentId) {
        List<QuizQuestionDTO> questions = questionService.getQuestionsByAssessment(assessmentId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizQuestionDTO> getQuestionById(@PathVariable Long id) {
        QuizQuestionDTO question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<QuizQuestionDTO> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody UpdateQuestionRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        QuizQuestionDTO question = questionService.updateQuestion(id, request, professorId);
        return ResponseEntity.ok(question);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        questionService.deleteQuestion(id, professorId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/assessment/{assessmentId}/reorder")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> reorderQuestions(
            @PathVariable Long assessmentId,
            @Valid @RequestBody ReorderQuestionsRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        questionService.reorderQuestions(assessmentId, request.getQuestionIds(), professorId);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

