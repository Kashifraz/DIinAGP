-- Feature 4: Course Management
-- Migration: Create courses table

CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    major_id BIGINT NOT NULL,
    professor_id BIGINT NULL,
    start_date DATE,
    end_date DATE,
    credit_hours INT DEFAULT 0,
    status ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_major_id (major_id),
    INDEX idx_professor_id (professor_id),
    INDEX idx_code (code),
    INDEX idx_status (status),
    FOREIGN KEY (major_id) REFERENCES course_majors(id) ON DELETE RESTRICT,
    FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

