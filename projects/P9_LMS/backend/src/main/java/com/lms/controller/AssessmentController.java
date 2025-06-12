package com.lms.controller;

import com.lms.dto.AssessmentDTO;
import com.lms.dto.CreateAssessmentRequest;
import com.lms.dto.UpdateAssessmentRequest;
import com.lms.repository.UserRepository;
import com.lms.service.AssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/assessments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final UserRepository userRepository;

    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<AssessmentDTO> createAssessment(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateAssessmentRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        AssessmentDTO assessment = assessmentService.createAssessment(courseId, request, professorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(assessment);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssessmentDTO>> getAssessmentsByCourse(@PathVariable Long courseId) {
        List<AssessmentDTO> assessments = assessmentService.getAssessmentsByCourse(courseId);
        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssessmentDTO> getAssessmentById(@PathVariable Long id) {
        AssessmentDTO assessment = assessmentService.getAssessmentById(id);
        return ResponseEntity.ok(assessment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<AssessmentDTO> updateAssessment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAssessmentRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        AssessmentDTO assessment = assessmentService.updateAssessment(id, request, professorId);
        return ResponseEntity.ok(assessment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> deleteAssessment(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        assessmentService.deleteAssessment(id, professorId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<AssessmentDTO> publishAssessment(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        AssessmentDTO assessment = assessmentService.publishAssessment(id, professorId);
        return ResponseEntity.ok(assessment);
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<AssessmentDTO> closeAssessment(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        AssessmentDTO assessment = assessmentService.closeAssessment(id, professorId);
        return ResponseEntity.ok(assessment);
    }

    @GetMapping("/course/{courseId}/validate-weights")
    public ResponseEntity<BigDecimal> validateWeights(@PathVariable Long courseId) {
        BigDecimal totalWeight = assessmentService.validateWeights(courseId);
        return ResponseEntity.ok(totalWeight);
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

