-- Add indexes for user search performance
-- Index on email for fast email searches
CREATE INDEX IF NOT EXISTS idx_users_email_search ON users(email);

-- Index on full_name for fast name searches
CREATE INDEX IF NOT EXISTS idx_users_full_name_search ON users(full_name);

-- Optional: FULLTEXT index for better text search (MySQL 5.6+)
-- Note: FULLTEXT indexes work best with MyISAM, but InnoDB also supports them in MySQL 5.6+
-- For InnoDB, FULLTEXT requires MySQL 5.6.4+ and can improve search quality
-- Uncomment the following if you want to use FULLTEXT search:
-- ALTER TABLE users ADD FULLTEXT INDEX idx_users_fulltext_search (full_name, email);

