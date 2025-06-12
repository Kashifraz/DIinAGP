-- Create hsk_vocabulary table
CREATE TABLE hsk_vocabulary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    simplified_chinese VARCHAR(50) NOT NULL,
    pinyin VARCHAR(100) NOT NULL,
    english_meaning VARCHAR(255) NOT NULL,
    detailed_explanation TEXT,
    hsk_level INT NOT NULL CHECK (hsk_level BETWEEN 1 AND 5),
    radicals VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_hsk_vocabulary_level ON hsk_vocabulary(hsk_level);
CREATE INDEX idx_hsk_vocabulary_chinese ON hsk_vocabulary(simplified_chinese);
CREATE INDEX idx_hsk_vocabulary_meaning ON hsk_vocabulary(english_meaning);
