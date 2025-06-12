package com.lms.controller;

import com.lms.dto.AttendanceRecordDTO;
import com.lms.dto.AttendanceSessionDTO;
import com.lms.dto.CreateAttendanceSessionRequest;
import com.lms.dto.ScanQRCodeRequest;
import com.lms.service.AttendanceService;
import com.lms.service.QRCodeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private QRCodeService qrCodeService;

    @Autowired
    private com.lms.service.UserService userService;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserIdByEmail(email);
    }

    @PostMapping("/courses/{courseId}/sessions")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<AttendanceSessionDTO> createAttendanceSession(
            @PathVariable Long courseId,
            @RequestBody @Valid CreateAttendanceSessionRequest request,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        AttendanceSessionDTO session = attendanceService.createAttendanceSession(courseId, professorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @GetMapping("/courses/{courseId}/sessions/active")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<AttendanceSessionDTO> getActiveSession(
            @PathVariable Long courseId,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        AttendanceSessionDTO session = attendanceService.getActiveSession(courseId, professorId);
        if (session == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(session);
    }

    @GetMapping("/courses/{courseId}/sessions")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<List<AttendanceSessionDTO>> getSessionsByCourse(
            @PathVariable Long courseId,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        List<AttendanceSessionDTO> sessions = attendanceService.getSessionsByCourse(courseId, professorId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/{sessionId}/qr-code")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<byte[]> getQRCodeImage(
            @PathVariable Long sessionId,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        
        // Get session to verify permissions and get QR code
        AttendanceSessionDTO session = attendanceService.getSessionById(sessionId, professorId);

        try {
            byte[] qrCodeImage = qrCodeService.generateQRCodeImage(session.getQrCode());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            headers.setContentLength(qrCodeImage.length);
            return new ResponseEntity<>(qrCodeImage, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/scan")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<AttendanceRecordDTO> scanQRCode(
            @RequestBody @Valid ScanQRCodeRequest request,
            Authentication authentication) {
        Long studentId = getUserIdFromAuthentication(authentication);
        AttendanceRecordDTO record = attendanceService.scanQRCode(request.getQrCode(), studentId);
        return ResponseEntity.ok(record);
    }

    @PutMapping("/sessions/{sessionId}/close")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> closeSession(
            @PathVariable Long sessionId,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        attendanceService.closeSession(sessionId, professorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessions/{sessionId}/records")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<List<AttendanceRecordDTO>> getRecordsBySession(
            @PathVariable Long sessionId,
            Authentication authentication) {
        Long professorId = getUserIdFromAuthentication(authentication);
        List<AttendanceRecordDTO> records = attendanceService.getRecordsBySession(sessionId, professorId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/students/{studentId}/records")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR', 'ROLE_COORDINATOR')")
    public ResponseEntity<List<AttendanceRecordDTO>> getRecordsByStudent(@PathVariable Long studentId) {
        List<AttendanceRecordDTO> records = attendanceService.getRecordsByStudent(studentId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/courses/{courseId}/students/{studentId}/records")
    @PreAuthorize("hasAnyAuthority('ROLE_STUDENT', 'ROLE_PROFESSOR', 'ROLE_COORDINATOR')")
    public ResponseEntity<List<AttendanceRecordDTO>> getRecordsByCourseAndStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        List<AttendanceRecordDTO> records = attendanceService.getRecordsByCourseAndStudent(courseId, studentId);
        return ResponseEntity.ok(records);
    }
}

