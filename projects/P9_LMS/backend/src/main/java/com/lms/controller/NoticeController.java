package com.lms.controller;

import com.lms.dto.CreateNoticeRequest;
import com.lms.dto.NoticeDTO;
import com.lms.dto.UpdateNoticeRequest;
import com.lms.service.NoticeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @Autowired
    private com.lms.service.UserService userService;

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserIdByEmail(email);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<NoticeDTO> createNotice(
            @RequestBody @Valid CreateNoticeRequest request,
            Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        NoticeDTO notice = noticeService.createNotice(coordinatorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(notice);
    }

    @GetMapping
    public ResponseEntity<List<NoticeDTO>> getAllNotices(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        List<NoticeDTO> notices = noticeService.getAllNotices(userId);
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/coordinator")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<List<NoticeDTO>> getAllNoticesForCoordinator(Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        List<NoticeDTO> notices = noticeService.getAllNoticesForCoordinator(coordinatorId);
        return ResponseEntity.ok(notices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoticeDTO> getNoticeById(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        NoticeDTO notice = noticeService.getNoticeById(id, userId);
        return ResponseEntity.ok(notice);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<NoticeDTO> updateNotice(
            @PathVariable Long id,
            @RequestBody @Valid UpdateNoticeRequest request,
            Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        NoticeDTO notice = noticeService.updateNotice(id, coordinatorId, request);
        return ResponseEntity.ok(notice);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long id,
            Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        noticeService.deleteNotice(id, coordinatorId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('ROLE_COORDINATOR')")
    public ResponseEntity<NoticeDTO> publishNotice(
            @PathVariable Long id,
            Authentication authentication) {
        Long coordinatorId = getUserIdFromAuthentication(authentication);
        NoticeDTO notice = noticeService.publishNotice(id, coordinatorId);
        return ResponseEntity.ok(notice);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        noticeService.markAsRead(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        Long count = noticeService.getUnreadCount(userId);
        return ResponseEntity.ok(count);
    }
}

