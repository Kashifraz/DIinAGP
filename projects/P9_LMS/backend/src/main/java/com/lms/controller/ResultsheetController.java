package com.lms.controller;

import com.lms.dto.ResultsheetDTO;
import com.lms.entity.User;
import com.lms.repository.UserRepository;
import com.lms.service.ResultsheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resultsheets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResultsheetController {

    private final ResultsheetService resultsheetService;

    @Autowired
    private com.lms.service.UserService userService;

    @Autowired
    private UserRepository userRepository;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserIdByEmail(email);
    }

    /**
     * Get resultsheet for a specific student in a specific course
     * Accessible by: Student (own resultsheet) and Professor (for students in their courses)
     */
    @GetMapping("/courses/{courseId}/resultsheet/student/{studentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR')")
    public ResponseEntity<ResultsheetDTO> getResultsheetByCourseAndStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuthentication(authentication);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Students can only view their own resultsheets
        if (user.getRole() == User.Role.STUDENT && !userId.equals(studentId)) {
            throw new RuntimeException("You can only view your own resultsheets");
        }
        
        ResultsheetDTO resultsheet = resultsheetService.getResultsheetByCourse(courseId, studentId);
        return ResponseEntity.ok(resultsheet);
    }

    /**
     * Get all resultsheets for a student (across all enrolled courses)
     * Accessible by: Student only (own resultsheets)
     */
    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<List<ResultsheetDTO>> getResultsheetsByStudent(
            @PathVariable Long studentId,
            Authentication authentication) {
        
        Long userId = getUserIdFromAuthentication(authentication);
        
        // Students can only view their own resultsheets
        if (!userId.equals(studentId)) {
            throw new RuntimeException("You can only view your own resultsheets");
        }
        
        List<ResultsheetDTO> resultsheets = resultsheetService.getResultsheetsByStudent(studentId);
        return ResponseEntity.ok(resultsheets);
    }

    /**
     * Get all resultsheets for a course (all students enrolled in the course)
     * Accessible by: Professor only (for their assigned courses)
     */
    @GetMapping("/courses/{courseId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<List<ResultsheetDTO>> getResultsheetsByCourse(
            @PathVariable Long courseId,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        List<ResultsheetDTO> resultsheets = resultsheetService.getResultsheetsByCourse(courseId, professorId);
        return ResponseEntity.ok(resultsheets);
    }
}

