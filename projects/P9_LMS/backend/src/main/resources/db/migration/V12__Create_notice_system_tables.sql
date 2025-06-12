-- Feature 11: Notice/Announcement System
-- Migration: Create notices and notice_reads tables

-- Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    coordinator_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('EXAM', 'HOLIDAY', 'GENERAL', 'URGENT') NOT NULL DEFAULT 'GENERAL',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    expiration_date DATETIME NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'EXPIRED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notice_coordinator FOREIGN KEY (coordinator_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notice_coordinator (coordinator_id),
    INDEX idx_notice_status (status),
    INDEX idx_notice_expiration (expiration_date),
    INDEX idx_notice_category (category),
    INDEX idx_notice_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notice Reads Table (track read status)
CREATE TABLE IF NOT EXISTS notice_reads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notice_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notice_read_notice FOREIGN KEY (notice_id) REFERENCES notices (id) ON DELETE CASCADE,
    CONSTRAINT fk_notice_read_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uk_notice_read UNIQUE (notice_id, user_id),
    INDEX idx_notice_read_notice (notice_id),
    INDEX idx_notice_read_user (user_id),
    INDEX idx_notice_read_read_at (read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

