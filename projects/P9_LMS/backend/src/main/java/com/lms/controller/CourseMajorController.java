package com.lms.controller;

import com.lms.dto.CourseMajorDTO;
import com.lms.dto.CreateMajorRequest;
import com.lms.dto.UpdateMajorRequest;
import com.lms.repository.UserRepository;
import com.lms.service.CourseMajorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/majors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseMajorController {

    private final CourseMajorService courseMajorService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<CourseMajorDTO> createMajor(
            @Valid @RequestBody CreateMajorRequest request,
            Authentication authentication) {
        
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        CourseMajorDTO major = courseMajorService.createMajor(request, coordinatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(major);
    }

    @GetMapping
    public ResponseEntity<List<CourseMajorDTO>> getAllMajors() {
        List<CourseMajorDTO> majors = courseMajorService.getAllMajors();
        return ResponseEntity.ok(majors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseMajorDTO> getMajorById(@PathVariable Long id) {
        CourseMajorDTO major = courseMajorService.getMajorById(id);
        return ResponseEntity.ok(major);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<CourseMajorDTO> updateMajor(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMajorRequest request,
            Authentication authentication) {
        
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        CourseMajorDTO major = courseMajorService.updateMajor(id, request, coordinatorId);
        return ResponseEntity.ok(major);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<Void> deleteMajor(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        courseMajorService.deleteMajor(id, coordinatorId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

