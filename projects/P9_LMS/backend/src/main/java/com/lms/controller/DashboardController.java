package com.lms.controller;

import com.lms.dto.CoordinatorDashboardDTO;
import com.lms.dto.ProfessorDashboardDTO;
import com.lms.dto.StudentDashboardDTO;
import com.lms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    private com.lms.service.UserService userService;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserIdByEmail(email);
    }

    @GetMapping("/coordinator")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<CoordinatorDashboardDTO> getCoordinatorDashboard(Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        CoordinatorDashboardDTO dashboard = dashboardService.getCoordinatorDashboard(coordinatorId);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/professor")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<ProfessorDashboardDTO> getProfessorDashboard(Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        ProfessorDashboardDTO dashboard = dashboardService.getProfessorDashboard(professorId);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/student")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<StudentDashboardDTO> getStudentDashboard(Authentication authentication) {
        Long studentId = getUserIdFromAuthentication(authentication);
        StudentDashboardDTO dashboard = dashboardService.getStudentDashboard(studentId);
        return ResponseEntity.ok(dashboard);
    }
}

