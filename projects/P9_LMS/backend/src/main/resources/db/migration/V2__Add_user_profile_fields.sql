-- Feature 2: User Management
-- Migration: Add additional profile fields to users table

ALTER TABLE users 
ADD COLUMN phone_number VARCHAR(20) NULL,
ADD COLUMN profile_picture_url VARCHAR(500) NULL,
ADD COLUMN last_login_at TIMESTAMP NULL;

-- Create indexes for search functionality
CREATE INDEX idx_users_first_name ON users(first_name);
CREATE INDEX idx_users_last_name ON users(last_name);
CREATE INDEX idx_users_full_name ON users(first_name, last_name);

