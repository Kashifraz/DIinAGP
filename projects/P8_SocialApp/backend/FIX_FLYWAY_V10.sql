-- Fix failed Flyway migration for version 10
-- Run this in your MySQL database

USE socialapp_db;

-- Check current status
SELECT * FROM flyway_schema_history WHERE version = 10;

-- If the migration failed, delete the failed record
DELETE FROM flyway_schema_history WHERE version = 10 AND success = 0;

-- Or if you want to mark it as resolved (if the table was created successfully)
-- UPDATE flyway_schema_history 
-- SET success = 1, installed_on = NOW(), execution_time = 0
-- WHERE version = 10;

-- Verify
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

