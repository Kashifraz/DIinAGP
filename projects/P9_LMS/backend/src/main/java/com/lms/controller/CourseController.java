package com.lms.controller;

import com.lms.dto.CourseDTO;
import com.lms.dto.CreateCourseRequest;
import com.lms.dto.UpdateCourseRequest;
import com.lms.repository.UserRepository;
import com.lms.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseController {

    private final CourseService courseService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<CourseDTO> createCourse(
            @Valid @RequestBody CreateCourseRequest request,
            Authentication authentication) {
        
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        CourseDTO course = courseService.createCourse(request, coordinatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses(
            @RequestParam(required = false) Long majorId) {
        
        List<CourseDTO> courses;
        if (majorId != null) {
            courses = courseService.getCoursesByMajor(majorId);
        } else {
            courses = courseService.getAllCourses();
        }
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseRequest request,
            Authentication authentication) {
        
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        CourseDTO course = courseService.updateCourse(id, request, coordinatorId);
        return ResponseEntity.ok(course);
    }

    @PutMapping("/{id}/assign-professor")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<CourseDTO> assignProfessor(
            @PathVariable Long id,
            @RequestParam Long professorId,
            Authentication authentication) {
        
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        CourseDTO course = courseService.assignProfessor(id, professorId, coordinatorId);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/major/{majorId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByMajor(@PathVariable Long majorId) {
        List<CourseDTO> courses = courseService.getCoursesByMajor(majorId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/professor/{professorId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByProfessor(@PathVariable Long professorId) {
        List<CourseDTO> courses = courseService.getCoursesByProfessor(professorId);
        return ResponseEntity.ok(courses);
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

