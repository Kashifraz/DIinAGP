-- Clean Database Script
-- Use this if you need to reset the database completely

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS quiz_results;
DROP TABLE IF EXISTS quiz_attempts;
DROP TABLE IF EXISTS learning_sessions;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS hsk_vocabulary;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS flyway_schema_history;

-- Recreate database
CREATE DATABASE IF NOT EXISTS vocabulary_app;
USE vocabulary_app;
