-- Feature 7: Assessment Management
-- Migration: Create assessments and quiz_questions tables

-- Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    professor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assessment_type ENUM('ASSIGNMENT', 'QUIZ') NOT NULL,
    weight_percentage DECIMAL(5,2) NOT NULL,
    maximum_marks DECIMAL(10,2) NOT NULL,
    deadline DATETIME NULL,
    time_limit_minutes INT NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_assessment_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_assessment_professor FOREIGN KEY (professor_id) REFERENCES users (id),
    INDEX idx_assessment_course (course_id),
    INDEX idx_assessment_type (assessment_type),
    INDEX idx_assessment_status (status),
    INDEX idx_assessment_professor (professor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER') NOT NULL,
    options TEXT NULL,
    correct_answer TEXT NOT NULL,
    points DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_question_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
    INDEX idx_question_assessment (assessment_id),
    INDEX idx_question_order (assessment_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

