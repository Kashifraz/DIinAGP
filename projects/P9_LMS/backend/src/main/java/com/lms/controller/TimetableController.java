package com.lms.controller;

import com.lms.dto.CreateTimetableRequest;
import com.lms.dto.TimetableEntryDTO;
import com.lms.dto.UpdateTimetableRequest;
import com.lms.service.TimetableService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/timetable")
@CrossOrigin(origins = "*")
public class TimetableController {

    @Autowired
    private TimetableService timetableService;

    @Autowired
    private com.lms.service.UserService userService;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserIdByEmail(email);
    }

    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<TimetableEntryDTO> createTimetableEntry(
            @PathVariable Long courseId,
            @RequestBody @Valid CreateTimetableRequest request,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        TimetableEntryDTO entry = timetableService.createTimetableEntry(courseId, professorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<List<TimetableEntryDTO>> getTimetableByCourse(@PathVariable Long courseId) {
        List<TimetableEntryDTO> entries = timetableService.getTimetableByCourse(courseId);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR', 'ROLE_COORDINATOR')")
    public ResponseEntity<List<TimetableEntryDTO>> getTimetableByStudent(@PathVariable Long studentId) {
        List<TimetableEntryDTO> entries = timetableService.getTimetableByStudent(studentId);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/professors/{professorId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_COORDINATOR')")
    public ResponseEntity<List<TimetableEntryDTO>> getTimetableByProfessor(@PathVariable Long professorId) {
        List<TimetableEntryDTO> entries = timetableService.getTimetableByProfessor(professorId);
        return ResponseEntity.ok(entries);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<TimetableEntryDTO> updateTimetableEntry(
            @PathVariable Long id,
            @RequestBody @Valid UpdateTimetableRequest request,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        TimetableEntryDTO entry = timetableService.updateTimetableEntry(id, professorId, request);
        return ResponseEntity.ok(entry);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> deleteTimetableEntry(
            @PathVariable Long id,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        timetableService.deleteTimetableEntry(id, professorId);
        return ResponseEntity.noContent().build();
    }
}

