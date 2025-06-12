-- Feature 7: Fix quiz_questions options column type for MySQL 5.5 compatibility
-- Migration: Change options column from JSON to TEXT

ALTER TABLE quiz_questions MODIFY COLUMN options TEXT NULL;

