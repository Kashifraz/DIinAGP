package com.lms.repository;

import com.lms.entity.NoticeRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeReadRepository extends JpaRepository<NoticeRead, Long> {
    
    Optional<NoticeRead> findByNoticeIdAndUserId(Long noticeId, Long userId);
    
    List<NoticeRead> findByUserId(Long userId);
    
    List<NoticeRead> findByNoticeId(Long noticeId);
    
    boolean existsByNoticeIdAndUserId(Long noticeId, Long userId);
    
    long countByNoticeId(Long noticeId);
}

