package com.lms.controller;

import com.lms.dto.SubmissionDTO;
import com.lms.dto.SubmitAssignmentRequest;
import com.lms.dto.SubmitQuizRequest;
import com.lms.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submissions")
@CrossOrigin(origins = "*")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private com.lms.service.UserService userService;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserIdByEmail(email);
    }

    @PostMapping("/assessments/{assessmentId}/submit-assignment")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<SubmissionDTO> submitAssignment(
            @PathVariable Long assessmentId,
            @ModelAttribute @Valid SubmitAssignmentRequest request,
            Authentication authentication) {
        Long studentId = getUserIdFromAuthentication(authentication);
        SubmissionDTO submission = submissionService.submitAssignment(assessmentId, studentId, request.getFile());
        return ResponseEntity.ok(submission);
    }

    @PostMapping("/assessments/{assessmentId}/submit-quiz")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<SubmissionDTO> submitQuiz(
            @PathVariable Long assessmentId,
            @RequestBody @Valid SubmitQuizRequest request,
            Authentication authentication) {
        Long studentId = getUserIdFromAuthentication(authentication);
        SubmissionDTO submission = submissionService.submitQuiz(assessmentId, studentId, request.getAnswers());
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/assessments/{assessmentId}/submissions")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByAssessment(@PathVariable Long assessmentId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByAssessment(assessmentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable Long id) {
        SubmissionDTO submission = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/students/{studentId}/submissions")
    public ResponseEntity<List<SubmissionDTO>> getSubmissionsByStudent(@PathVariable Long studentId) {
        List<SubmissionDTO> submissions = submissionService.getSubmissionsByStudent(studentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadSubmission(
            @PathVariable Long id) {
        org.springframework.core.io.Resource resource = submissionService.downloadSubmissionFile(id);
        
        // Get submission to extract filename
        SubmissionDTO submission = submissionService.getSubmissionById(id);
        String filePath = submission.getSubmittedFilePath();
        String fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
        
        // Determine content type
        org.springframework.http.MediaType mediaType = org.springframework.http.MediaType.APPLICATION_OCTET_STREAM;
        if (fileName.toLowerCase().endsWith(".pdf")) {
            mediaType = org.springframework.http.MediaType.APPLICATION_PDF;
        } else if (fileName.toLowerCase().endsWith(".doc") || fileName.toLowerCase().endsWith(".docx")) {
            mediaType = org.springframework.http.MediaType.valueOf("application/msword");
        } else if (fileName.toLowerCase().endsWith(".ppt") || fileName.toLowerCase().endsWith(".pptx")) {
            mediaType = org.springframework.http.MediaType.valueOf("application/vnd.ms-powerpoint");
        }
        
        return org.springframework.http.ResponseEntity.ok()
                .contentType(mediaType)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}

