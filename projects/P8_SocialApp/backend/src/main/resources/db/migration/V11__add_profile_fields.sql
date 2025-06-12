-- Add new fields to profiles table
ALTER TABLE profiles
ADD COLUMN occupation VARCHAR(200) NULL COMMENT 'User occupation/job title',
ADD COLUMN relationship_status ENUM('SINGLE', 'IN_RELATIONSHIP', 'MARRIED') NULL COMMENT 'User relationship status',
ADD COLUMN hobbies TEXT NULL COMMENT 'User hobbies/interests';

