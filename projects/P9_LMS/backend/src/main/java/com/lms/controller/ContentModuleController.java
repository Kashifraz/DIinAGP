package com.lms.controller;

import com.lms.dto.ContentModuleDTO;
import com.lms.dto.CreateModuleRequest;
import com.lms.dto.ReorderModulesRequest;
import com.lms.dto.UpdateModuleRequest;
import com.lms.repository.UserRepository;
import com.lms.service.ContentModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/modules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContentModuleController {

    private final ContentModuleService moduleService;
    private final UserRepository userRepository;

    @PostMapping("/course/{courseId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<ContentModuleDTO> createModule(
            @PathVariable Long courseId,
            @Valid @RequestBody CreateModuleRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        // Set courseId from path variable (validation already passed for other fields)
        request.setCourseId(courseId);
        ContentModuleDTO module = moduleService.createModule(request, professorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(module);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ContentModuleDTO>> getModulesByCourse(@PathVariable Long courseId) {
        List<ContentModuleDTO> modules = moduleService.getModulesByCourse(courseId);
        return ResponseEntity.ok(modules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentModuleDTO> getModuleById(@PathVariable Long id) {
        ContentModuleDTO module = moduleService.getModuleById(id);
        return ResponseEntity.ok(module);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<ContentModuleDTO> updateModule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateModuleRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        ContentModuleDTO module = moduleService.updateModule(id, request, professorId);
        return ResponseEntity.ok(module);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> deleteModule(
            @PathVariable Long id,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        moduleService.deleteModule(id, professorId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/course/{courseId}/reorder")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> reorderModules(
            @PathVariable Long courseId,
            @Valid @RequestBody ReorderModulesRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        moduleService.reorderModules(courseId, request.getModuleIds(), professorId);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

