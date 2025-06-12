-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    hsk_level INT NOT NULL,
    quiz_type ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    date_attempted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_level ON quiz_attempts(hsk_level);
CREATE INDEX idx_quiz_attempts_type ON quiz_attempts(quiz_type);
CREATE INDEX idx_quiz_attempts_date ON quiz_attempts(date_attempted);
