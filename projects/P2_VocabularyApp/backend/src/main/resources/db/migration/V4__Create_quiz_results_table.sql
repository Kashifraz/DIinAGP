-- Create quiz_results table
CREATE TABLE quiz_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_attempt_id BIGINT NOT NULL,
    question_word_id BIGINT NOT NULL,
    user_answer VARCHAR(255),
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_word_id) REFERENCES hsk_vocabulary(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_quiz_results_attempt ON quiz_results(quiz_attempt_id);
CREATE INDEX idx_quiz_results_word ON quiz_results(question_word_id);
CREATE INDEX idx_quiz_results_correct ON quiz_results(is_correct);
