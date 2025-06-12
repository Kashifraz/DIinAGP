-- Create learning_sessions table
CREATE TABLE learning_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hsk_level INT NOT NULL,
    current_word_index INT NOT NULL DEFAULT 0,
    words_per_session INT NOT NULL DEFAULT 10,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_learning_sessions_user ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_level ON learning_sessions(hsk_level);
CREATE INDEX idx_learning_sessions_completed ON learning_sessions(is_completed);
