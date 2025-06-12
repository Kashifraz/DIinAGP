-- Fix hsk_level data types from TINYINT to INT
-- This migration handles the data type mismatch between Flyway and Hibernate

-- Update hsk_vocabulary table
ALTER TABLE hsk_vocabulary MODIFY COLUMN hsk_level INT NOT NULL;

-- Update quiz_attempts table  
ALTER TABLE quiz_attempts MODIFY COLUMN hsk_level INT NOT NULL;

-- Update user_progress table
ALTER TABLE user_progress MODIFY COLUMN hsk_level INT NOT NULL;

-- Update learning_sessions table
ALTER TABLE learning_sessions MODIFY COLUMN hsk_level INT NOT NULL;
