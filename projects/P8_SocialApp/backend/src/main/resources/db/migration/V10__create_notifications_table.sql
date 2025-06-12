-- Create notifications table for notification history/persistence (optional)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'Notification recipient',
    type ENUM('LIKE', 'COMMENT', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'POST_MENTION') NOT NULL COMMENT 'Notification type',
    message TEXT NOT NULL COMMENT 'Notification message',
    post_id BIGINT NULL COMMENT 'Related post ID (nullable)',
    actor_id BIGINT NOT NULL COMMENT 'User who triggered the notification',
    is_read BOOLEAN DEFAULT FALSE COMMENT 'Whether notification has been read',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Notification creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Notification update timestamp',
    
    -- Foreign key constraints
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_notification_user_id (user_id),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_created_at (created_at),
    INDEX idx_notification_user_read (user_id, is_read),
    INDEX idx_notification_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notifications table for storing notification history';

