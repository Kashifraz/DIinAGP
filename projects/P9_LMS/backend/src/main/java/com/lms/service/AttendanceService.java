package com.lms.service;

import com.lms.dto.AttendanceRecordDTO;
import com.lms.dto.AttendanceSessionDTO;
import com.lms.dto.CreateAttendanceSessionRequest;
import com.lms.entity.AttendanceRecord;
import com.lms.entity.AttendanceSession;
import com.lms.entity.Course;
import com.lms.entity.CourseEnrollment;
import com.lms.entity.User;
import com.lms.repository.AttendanceRecordRepository;
import com.lms.repository.AttendanceSessionRepository;
import com.lms.repository.CourseEnrollmentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceRecordRepository recordRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private QRCodeService qrCodeService;

    private static final int DEFAULT_QR_CODE_DURATION_MINUTES = 15;

    @Transactional
    public AttendanceSessionDTO createAttendanceSession(Long courseId, Long professorId, CreateAttendanceSessionRequest request) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Validate professor is assigned to this course
        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to create attendance sessions for this course");
        }

        // Validate professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + professorId));

        if (professor.getRole() != User.Role.PROFESSOR) {
            throw new RuntimeException("User is not a professor");
        }

        // Generate QR code
        String qrCode = qrCodeService.generateQRCodeString();

        // Calculate expiration time
        int durationMinutes = request.getDurationMinutes() != null ? request.getDurationMinutes() : DEFAULT_QR_CODE_DURATION_MINUTES;
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(durationMinutes);

        // Create attendance session
        AttendanceSession session = new AttendanceSession();
        session.setCourse(course);
        session.setProfessor(professor);
        session.setSessionDate(request.getSessionDate());
        session.setQrCode(qrCode);
        session.setQrCodeExpiresAt(expiresAt);
        session.setStatus(AttendanceSession.Status.ACTIVE);

        session = sessionRepository.save(session);
        return convertSessionToDTO(session);
    }

    public AttendanceSessionDTO getActiveSession(Long courseId, Long professorId) {
        // Verify professor is assigned to this course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to access attendance sessions for this course");
        }

        // Find active session for today
        LocalDate today = LocalDate.now();
        List<AttendanceSession> sessions = sessionRepository.findByCourseIdAndSessionDate(courseId, today);
        
        AttendanceSession activeSession = sessions.stream()
                .filter(s -> s.getStatus() == AttendanceSession.Status.ACTIVE 
                        && s.getQrCodeExpiresAt().isAfter(LocalDateTime.now()))
                .findFirst()
                .orElse(null);

        if (activeSession == null) {
            return null;
        }

        return convertSessionToDTO(activeSession);
    }

    @Transactional
    public AttendanceRecordDTO scanQRCode(String qrCode, Long studentId) {
        // Find session by QR code
        AttendanceSession session = sessionRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Invalid QR code"));

        // Validate QR code format
        if (!qrCodeService.isValidQRCodeFormat(qrCode)) {
            throw new RuntimeException("Invalid QR code format");
        }

        // Check if session is active
        if (session.getStatus() != AttendanceSession.Status.ACTIVE) {
            throw new RuntimeException("Attendance session is not active");
        }

        // Check if QR code has expired
        if (session.getQrCodeExpiresAt().isBefore(LocalDateTime.now())) {
            // Auto-expire the session
            session.setStatus(AttendanceSession.Status.EXPIRED);
            sessionRepository.save(session);
            throw new RuntimeException("QR code has expired");
        }

        // Get student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        if (student.getRole() != User.Role.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        // Check if student is enrolled in the course
        enrollmentRepository.findByCourseIdAndStudentId(session.getCourse().getId(), studentId)
                .filter(e -> e.getStatus() == CourseEnrollment.Status.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Student is not actively enrolled in this course"));

        // Check if student has already scanned
        if (recordRepository.findBySessionIdAndStudentId(session.getId(), studentId).isPresent()) {
            throw new RuntimeException("You have already marked your attendance for this session");
        }

        // Create attendance record
        AttendanceRecord record = new AttendanceRecord();
        record.setSession(session);
        record.setStudent(student);
        record.setCourse(session.getCourse());
        record.setQrCodeUsed(qrCode);
        record.setScanTimestamp(LocalDateTime.now());
        record.setStatus(AttendanceRecord.Status.PRESENT);

        record = recordRepository.save(record);
        return convertRecordToDTO(record);
    }

    @Transactional
    public void closeSession(Long sessionId, Long professorId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Attendance session not found with id: " + sessionId));

        // Verify professor is assigned to this course
        if (session.getCourse().getProfessor() == null || !session.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to close this attendance session");
        }

        session.setStatus(AttendanceSession.Status.CLOSED);
        sessionRepository.save(session);
    }

    public List<AttendanceSessionDTO> getSessionsByCourse(Long courseId, Long professorId) {
        // Verify professor is assigned to this course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to access attendance sessions for this course");
        }

        List<AttendanceSession> sessions = sessionRepository.findByCourseIdOrderBySessionDateDesc(courseId);
        return sessions.stream()
                .map(this::convertSessionToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceRecordDTO> getRecordsBySession(Long sessionId, Long professorId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Attendance session not found with id: " + sessionId));

        // Verify professor is assigned to this course
        if (session.getCourse().getProfessor() == null || !session.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to access attendance records for this session");
        }

        List<AttendanceRecord> records = recordRepository.findBySessionId(sessionId);
        return records.stream()
                .map(this::convertRecordToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceRecordDTO> getRecordsByStudent(Long studentId) {
        List<AttendanceRecord> records = recordRepository.findByStudentId(studentId);
        return records.stream()
                .map(this::convertRecordToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceRecordDTO> getRecordsByCourseAndStudent(Long courseId, Long studentId) {
        List<AttendanceRecord> records = recordRepository.findByCourseIdAndStudentId(courseId, studentId);
        return records.stream()
                .map(this::convertRecordToDTO)
                .collect(Collectors.toList());
    }

    public AttendanceSessionDTO getSessionById(Long sessionId, Long professorId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Attendance session not found with id: " + sessionId));

        // Verify professor is assigned to this course
        if (session.getCourse().getProfessor() == null || !session.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to access this attendance session");
        }

        return convertSessionToDTO(session);
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void expireOldSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<AttendanceSession> expiredSessions = sessionRepository.findByQrCodeExpiresAtBeforeAndStatus(now, AttendanceSession.Status.ACTIVE);
        
        for (AttendanceSession session : expiredSessions) {
            session.setStatus(AttendanceSession.Status.EXPIRED);
            sessionRepository.save(session);
        }
    }

    private AttendanceSessionDTO convertSessionToDTO(AttendanceSession session) {
        AttendanceSessionDTO dto = new AttendanceSessionDTO();
        dto.setId(session.getId());
        dto.setCourseId(session.getCourse().getId());
        dto.setCourseName(session.getCourse().getName());
        dto.setCourseCode(session.getCourse().getCode());
        dto.setProfessorId(session.getProfessor().getId());
        dto.setProfessorName(session.getProfessor().getFirstName() + " " + session.getProfessor().getLastName());
        dto.setSessionDate(session.getSessionDate());
        dto.setQrCode(session.getQrCode());
        dto.setQrCodeExpiresAt(session.getQrCodeExpiresAt());
        dto.setStatus(session.getStatus());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setUpdatedAt(session.getUpdatedAt());

        // Calculate statistics
        List<AttendanceRecord> records = recordRepository.findBySessionId(session.getId());
        dto.setTotalStudents(records.size());
        dto.setPresentCount((int) records.stream()
                .filter(r -> r.getStatus() == AttendanceRecord.Status.PRESENT)
                .count());
        dto.setAbsentCount(dto.getTotalStudents() - dto.getPresentCount());

        return dto;
    }

    private AttendanceRecordDTO convertRecordToDTO(AttendanceRecord record) {
        AttendanceRecordDTO dto = new AttendanceRecordDTO();
        dto.setId(record.getId());
        dto.setSessionId(record.getSession().getId());
        dto.setStudentId(record.getStudent().getId());
        dto.setStudentName(record.getStudent().getFirstName() + " " + record.getStudent().getLastName());
        dto.setStudentEmail(record.getStudent().getEmail());
        dto.setCourseId(record.getCourse().getId());
        dto.setCourseName(record.getCourse().getName());
        dto.setCourseCode(record.getCourse().getCode());
        dto.setQrCodeUsed(record.getQrCodeUsed());
        dto.setScanTimestamp(record.getScanTimestamp());
        dto.setStatus(record.getStatus());
        dto.setSessionDate(record.getSession().getSessionDate()); // Add session date to DTO
        dto.setCreatedAt(record.getCreatedAt());
        dto.setUpdatedAt(record.getUpdatedAt());
        return dto;
    }
}

