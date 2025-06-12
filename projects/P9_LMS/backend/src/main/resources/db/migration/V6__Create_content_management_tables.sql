-- Feature 6: Content Management
-- Migration: Create content_modules and course_content tables

-- Content Modules Table
CREATE TABLE IF NOT EXISTS content_modules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_module_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    INDEX idx_module_course (course_id),
    INDEX idx_module_order (course_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Content Table
CREATE TABLE IF NOT EXISTS course_content (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type ENUM('FILE', 'LINK') NOT NULL,
    file_path VARCHAR(500) NULL,
    file_url VARCHAR(500) NULL,
    file_type ENUM('PDF', 'PPT', 'DOC', 'LINK', 'VIDEO') NULL,
    file_size BIGINT NULL,
    uploader_id BIGINT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_content_module FOREIGN KEY (module_id) REFERENCES content_modules (id) ON DELETE CASCADE,
    CONSTRAINT fk_content_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_content_uploader FOREIGN KEY (uploader_id) REFERENCES users (id),
    INDEX idx_content_module (module_id),
    INDEX idx_content_course (course_id),
    INDEX idx_content_order (module_id, display_order),
    INDEX idx_content_type (content_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

