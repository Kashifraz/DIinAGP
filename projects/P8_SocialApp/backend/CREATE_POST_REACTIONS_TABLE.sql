-- Quick Fix: Create post_reactions table
-- Run this in MySQL to create the missing table

USE socialapp_db;

-- Create the post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type ENUM('HEART', 'THUMBS_UP', 'LAUGH', 'SAD', 'ANGRY', 'THUMBS_DOWN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_reaction (post_id, user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reaction_type (reaction_type),
    INDEX idx_post_reaction (post_id, reaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify the table was created
SELECT 'post_reactions table created successfully!' AS status;
SHOW TABLES LIKE 'post_reactions';

