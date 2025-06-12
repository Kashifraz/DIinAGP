package com.lms.repository;

import com.lms.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByQrCode(String qrCode);
    List<AttendanceSession> findByCourseId(Long courseId);
    List<AttendanceSession> findByCourseIdOrderBySessionDateDesc(Long courseId);
    List<AttendanceSession> findByProfessorId(Long professorId);
    List<AttendanceSession> findByCourseIdAndSessionDate(Long courseId, LocalDate sessionDate);
    List<AttendanceSession> findByStatus(AttendanceSession.Status status);
    List<AttendanceSession> findByQrCodeExpiresAtBeforeAndStatus(LocalDateTime expiresAt, AttendanceSession.Status status);
}

