-- Create categories table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
);

-- Insert some default categories
INSERT INTO categories (name, description, sort_order) VALUES
('Electronics', 'Electronic devices and gadgets', 1),
('Clothing', 'Fashion and apparel', 2),
('Home & Garden', 'Home improvement and garden supplies', 3),
('Sports & Outdoors', 'Sports equipment and outdoor gear', 4),
('Books & Media', 'Books, movies, and music', 5),
('Automotive', 'Car parts and accessories', 6),
('Health & Beauty', 'Health products and beauty supplies', 7),
('Toys & Games', 'Toys, games, and entertainment', 8);
