package com.lms.repository;

import com.lms.entity.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    Optional<AttendanceRecord> findBySessionIdAndStudentId(Long sessionId, Long studentId);
    List<AttendanceRecord> findBySessionId(Long sessionId);
    List<AttendanceRecord> findByStudentId(Long studentId);
    List<AttendanceRecord> findByCourseId(Long courseId);
    List<AttendanceRecord> findByCourseIdAndStudentId(Long courseId, Long studentId);
    List<AttendanceRecord> findByCourseIdAndStudentIdAndStatus(Long courseId, Long studentId, AttendanceRecord.Status status);
    long countBySessionIdAndStatus(Long sessionId, AttendanceRecord.Status status);
}

