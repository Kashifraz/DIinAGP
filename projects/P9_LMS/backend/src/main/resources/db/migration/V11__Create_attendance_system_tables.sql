-- Feature 10: Attendance System
-- Migration: Create attendance_sessions and attendance_records tables

-- Attendance Sessions Table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    session_date DATE NOT NULL,
    qr_code VARCHAR(255) NOT NULL UNIQUE,
    qr_code_expires_at DATETIME NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attendance_session_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_session_professor FOREIGN KEY (professor_id) REFERENCES users (id),
    INDEX idx_attendance_session_course (course_id),
    INDEX idx_attendance_session_professor (professor_id),
    INDEX idx_attendance_session_date (session_date),
    INDEX idx_attendance_session_status (status),
    INDEX idx_attendance_session_qr_code (qr_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    qr_code_used VARCHAR(255) NOT NULL,
    scan_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PRESENT', 'ABSENT') NOT NULL DEFAULT 'PRESENT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_attendance_record_session FOREIGN KEY (session_id) REFERENCES attendance_sessions (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_record_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_record_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT uk_session_student_record UNIQUE (session_id, student_id),
    INDEX idx_attendance_record_session (session_id),
    INDEX idx_attendance_record_student (student_id),
    INDEX idx_attendance_record_course (course_id),
    INDEX idx_attendance_record_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

