package com.lms.controller;

import com.lms.dto.BulkEnrollmentRequest;
import com.lms.dto.EnrollmentDTO;
import com.lms.repository.UserRepository;
import com.lms.service.CourseEnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/enrollments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseEnrollmentController {

    private final CourseEnrollmentService enrollmentService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<EnrollmentDTO> enrollStudent(
            @RequestParam Long courseId,
            @RequestParam Long studentId,
            Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        EnrollmentDTO enrollment = enrollmentService.enrollStudent(courseId, studentId, coordinatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollment);
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<List<EnrollmentDTO>> bulkEnrollStudents(
            @Valid @RequestBody BulkEnrollmentRequest request,
            Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        List<EnrollmentDTO> enrollments = enrollmentService.bulkEnrollStudents(request, coordinatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollments);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByCourse(
            @PathVariable Long courseId) {
        List<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentDTO>> getEnrollmentsByStudent(
            @PathVariable Long studentId) {
        List<EnrollmentDTO> enrollments = enrollmentService.getEnrollmentsByStudent(studentId);
        return ResponseEntity.ok(enrollments);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<Void> dropEnrollment(
            @PathVariable Long id,
            Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        enrollmentService.dropEnrollment(id, coordinatorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkEnrollment(
            @RequestParam Long courseId,
            @RequestParam Long studentId) {
        boolean isEnrolled = enrollmentService.checkEnrollment(courseId, studentId);
        return ResponseEntity.ok(isEnrolled);
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

