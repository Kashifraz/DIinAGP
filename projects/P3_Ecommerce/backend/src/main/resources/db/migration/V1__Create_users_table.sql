-- Create users table with all required fields
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_verification_token ON users(verification_token);
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_email_verified ON users(email_verified);

-- Insert a default admin user (password: admin123)
-- Note: This is a BCrypt hash of 'admin123' - you should change this in production
INSERT INTO users (email, password_hash, first_name, last_name, role, email_verified, created_at, updated_at) 
VALUES ('admin@ecommerce.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Admin', 'User', 'ADMIN', TRUE, NOW(), NOW());
