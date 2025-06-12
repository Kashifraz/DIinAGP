package com.lms.repository;

import com.lms.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    List<Notice> findByStatusOrderByCreatedAtDesc(Notice.Status status);
    
    List<Notice> findByCoordinatorIdOrderByCreatedAtDesc(Long coordinatorId);
    
    List<Notice> findByStatusAndExpirationDateBefore(Notice.Status status, LocalDateTime dateTime);
    
    List<Notice> findByStatusAndCategoryOrderByPriorityDescCreatedAtDesc(Notice.Status status, Notice.Category category);
    
    List<Notice> findByStatusOrderByPriorityDescCreatedAtDesc(Notice.Status status);
    
    Optional<Notice> findByIdAndStatus(Long id, Notice.Status status);
}

