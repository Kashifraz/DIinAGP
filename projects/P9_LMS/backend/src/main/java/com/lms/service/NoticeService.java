package com.lms.service;

import com.lms.dto.CreateNoticeRequest;
import com.lms.dto.NoticeDTO;
import com.lms.dto.UpdateNoticeRequest;
import com.lms.entity.Notice;
import com.lms.entity.NoticeRead;
import com.lms.entity.User;
import com.lms.repository.NoticeReadRepository;
import com.lms.repository.NoticeRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private NoticeReadRepository noticeReadRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public NoticeDTO createNotice(Long coordinatorId, CreateNoticeRequest request) {
        // Validate coordinator
        User coordinator = userRepository.findById(coordinatorId)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with id: " + coordinatorId));

        if (coordinator.getRole() != User.Role.COORDINATOR) {
            throw new RuntimeException("User is not a coordinator");
        }

        // Create notice
        Notice notice = new Notice();
        notice.setCoordinator(coordinator);
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setCategory(request.getCategory());
        notice.setPriority(request.getPriority());
        notice.setExpirationDate(request.getExpirationDate());
        notice.setStatus(Notice.Status.DRAFT);

        notice = noticeRepository.save(notice);
        return convertToDTO(notice, null);
    }

    public List<NoticeDTO> getAllNotices(Long userId) {
        List<Notice> notices = noticeRepository.findByStatusOrderByPriorityDescCreatedAtDesc(Notice.Status.PUBLISHED);
        return notices.stream()
                .map(notice -> {
                    boolean isRead = noticeReadRepository.existsByNoticeIdAndUserId(notice.getId(), userId);
                    return convertToDTO(notice, userId);
                })
                .collect(Collectors.toList());
    }

    public List<NoticeDTO> getAllNoticesForCoordinator(Long coordinatorId) {
        List<Notice> notices = noticeRepository.findByCoordinatorIdOrderByCreatedAtDesc(coordinatorId);
        return notices.stream()
                .map(notice -> convertToDTO(notice, null))
                .collect(Collectors.toList());
    }

    public NoticeDTO getNoticeById(Long noticeId, Long userId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + noticeId));

        // Only published notices are visible to non-coordinators
        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null && user.getRole() != User.Role.COORDINATOR && notice.getStatus() != Notice.Status.PUBLISHED) {
                throw new RuntimeException("Notice is not published");
            }
        }

        return convertToDTO(notice, userId);
    }

    @Transactional
    public NoticeDTO updateNotice(Long noticeId, Long coordinatorId, UpdateNoticeRequest request) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + noticeId));

        // Verify coordinator owns this notice
        if (!notice.getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to update this notice");
        }

        // Can't update published notices (must unpublish first or create new version)
        if (notice.getStatus() == Notice.Status.PUBLISHED) {
            throw new RuntimeException("Cannot update a published notice. Create a new notice or unpublish first.");
        }

        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setCategory(request.getCategory());
        notice.setPriority(request.getPriority());
        notice.setExpirationDate(request.getExpirationDate());

        notice = noticeRepository.save(notice);
        return convertToDTO(notice, null);
    }

    @Transactional
    public void deleteNotice(Long noticeId, Long coordinatorId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + noticeId));

        // Verify coordinator owns this notice
        if (!notice.getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to delete this notice");
        }

        noticeRepository.delete(notice);
    }

    @Transactional
    public NoticeDTO publishNotice(Long noticeId, Long coordinatorId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + noticeId));

        // Verify coordinator owns this notice
        if (!notice.getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to publish this notice");
        }

        if (notice.getStatus() == Notice.Status.PUBLISHED) {
            throw new RuntimeException("Notice is already published");
        }

        if (notice.getStatus() == Notice.Status.EXPIRED) {
            throw new RuntimeException("Cannot publish an expired notice");
        }

        notice.setStatus(Notice.Status.PUBLISHED);
        notice = noticeRepository.save(notice);
        return convertToDTO(notice, null);
    }

    @Transactional
    public void markAsRead(Long noticeId, Long userId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new RuntimeException("Notice not found with id: " + noticeId));

        if (notice.getStatus() != Notice.Status.PUBLISHED) {
            throw new RuntimeException("Cannot mark a non-published notice as read");
        }

        // Check if already read
        Optional<NoticeRead> existingRead = noticeReadRepository.findByNoticeIdAndUserId(noticeId, userId);
        if (existingRead.isPresent()) {
            return; // Already marked as read
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        NoticeRead noticeRead = new NoticeRead();
        noticeRead.setNotice(notice);
        noticeRead.setUser(user);
        noticeRead.setReadAt(LocalDateTime.now());

        noticeReadRepository.save(noticeRead);
    }

    public Long getUnreadCount(Long userId) {
        List<Notice> publishedNotices = noticeRepository.findByStatusOrderByCreatedAtDesc(Notice.Status.PUBLISHED);
        long unreadCount = 0;

        for (Notice notice : publishedNotices) {
            // Check if notice has expired
            if (notice.getExpirationDate() != null && notice.getExpirationDate().isBefore(LocalDateTime.now())) {
                continue; // Skip expired notices
            }

            if (!noticeReadRepository.existsByNoticeIdAndUserId(notice.getId(), userId)) {
                unreadCount++;
            }
        }

        return unreadCount;
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void expireNotices() {
        LocalDateTime now = LocalDateTime.now();
        List<Notice> expiredNotices = noticeRepository.findByStatusAndExpirationDateBefore(Notice.Status.PUBLISHED, now);

        for (Notice notice : expiredNotices) {
            notice.setStatus(Notice.Status.EXPIRED);
            noticeRepository.save(notice);
        }
    }

    private NoticeDTO convertToDTO(Notice notice, Long userId) {
        NoticeDTO dto = new NoticeDTO();
        dto.setId(notice.getId());
        dto.setCoordinatorId(notice.getCoordinator().getId());
        dto.setCoordinatorName(notice.getCoordinator().getFirstName() + " " + notice.getCoordinator().getLastName());
        dto.setTitle(notice.getTitle());
        dto.setContent(notice.getContent());
        dto.setCategory(notice.getCategory());
        dto.setPriority(notice.getPriority());
        dto.setExpirationDate(notice.getExpirationDate());
        dto.setStatus(notice.getStatus());
        dto.setCreatedAt(notice.getCreatedAt());
        dto.setUpdatedAt(notice.getUpdatedAt());
        dto.setReadCount(noticeReadRepository.countByNoticeId(notice.getId()));

        if (userId != null) {
            dto.setRead(noticeReadRepository.existsByNoticeIdAndUserId(notice.getId(), userId));
        } else {
            dto.setRead(false);
        }

        return dto;
    }
}

