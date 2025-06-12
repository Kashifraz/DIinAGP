-- Create learning_progress table to track individual word progress
CREATE TABLE learning_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    is_learned BOOLEAN NOT NULL DEFAULT FALSE,
    times_reviewed INT NOT NULL DEFAULT 0,
    last_reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES hsk_vocabulary(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_vocabulary_session (user_id, vocabulary_id, session_id)
);

-- Create indexes for better performance
CREATE INDEX idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX idx_learning_progress_vocabulary ON learning_progress(vocabulary_id);
CREATE INDEX idx_learning_progress_session ON learning_progress(session_id);
CREATE INDEX idx_learning_progress_learned ON learning_progress(is_learned);
CREATE INDEX idx_learning_progress_last_reviewed ON learning_progress(last_reviewed_at);
