package com.lms.controller;

import com.lms.dto.CourseGradeDTO;
import com.lms.dto.GradeDTO;
import com.lms.dto.GradeRequest;
import com.lms.dto.UpdateGradeRequest;
import com.lms.service.GradeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grades")
@CrossOrigin(origins = "*")
public class GradeController {

    @Autowired
    private GradeService gradeService;

    @Autowired
    private com.lms.service.UserService userService;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserIdByEmail(email);
    }

    @PostMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<GradeDTO> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody @Valid GradeRequest request,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        GradeDTO grade = gradeService.gradeSubmission(submissionId, professorId, request);
        return ResponseEntity.ok(grade);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<GradeDTO> updateGrade(
            @PathVariable Long id,
            @RequestBody @Valid UpdateGradeRequest request,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        GradeDTO grade = gradeService.updateGrade(id, professorId, request);
        return ResponseEntity.ok(grade);
    }

    @GetMapping("/assessments/{assessmentId}/grades")
    public ResponseEntity<List<GradeDTO>> getGradesByAssessment(@PathVariable Long assessmentId) {
        List<GradeDTO> grades = gradeService.getGradesByAssessment(assessmentId);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/courses/{courseId}/grades/student/{studentId}")
    public ResponseEntity<List<GradeDTO>> getGradesByCourseAndStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        List<GradeDTO> grades = gradeService.getGradesByCourseAndStudent(courseId, studentId);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/courses/{courseId}/grades")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<List<GradeDTO>> getGradesByCourse(@PathVariable Long courseId) {
        List<GradeDTO> grades = gradeService.getGradesByCourse(courseId);
        return ResponseEntity.ok(grades);
    }

    @GetMapping("/courses/{courseId}/course-grade/student/{studentId}")
    public ResponseEntity<CourseGradeDTO> getCourseGrade(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        CourseGradeDTO courseGrade = gradeService.getCourseGrade(courseId, studentId);
        return ResponseEntity.ok(courseGrade);
    }

    @PostMapping("/courses/{courseId}/calculate-grade/student/{studentId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<CourseGradeDTO> calculateCourseGrade(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        CourseGradeDTO courseGrade = gradeService.calculateCourseGrade(courseId, studentId);
        return ResponseEntity.ok(courseGrade);
    }
}

