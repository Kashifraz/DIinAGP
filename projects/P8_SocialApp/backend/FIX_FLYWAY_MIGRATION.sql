-- Fix Flyway Migration V7 Checksum Mismatch
-- Run this SQL script in your MySQL database to update the Flyway schema history

-- First, check if the old likes table exists and drop it if needed
DROP TABLE IF EXISTS likes;

-- Update the Flyway schema history to reflect the new V7 migration
-- This updates the checksum and description for version 7
UPDATE flyway_schema_history 
SET 
    checksum = 878282643,  -- New checksum for create_post_reactions_table.sql
    description = 'create post reactions table',
    script = 'V7__create_post_reactions_table.sql'
WHERE version = 7;

-- Verify the update
SELECT * FROM flyway_schema_history WHERE version = 7;

