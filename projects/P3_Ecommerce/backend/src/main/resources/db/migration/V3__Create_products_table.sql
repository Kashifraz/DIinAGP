-- Create products table
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    category_id BIGINT NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    
    -- Indexes for performance
    INDEX idx_name (name),
    INDEX idx_category_id (category_id),
    INDEX idx_is_active (is_active),
    INDEX idx_sku (sku),
    INDEX idx_price (price),
    INDEX idx_stock_quantity (stock_quantity),
    INDEX idx_brand (brand),
    INDEX idx_created_at (created_at)
);

-- Insert some sample products for testing
INSERT INTO products (name, description, price, stock_quantity, category_id, sku, brand, is_active) VALUES
('iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 Pro chip', 999.99, 50, 1, 'IPH15PRO-001', 'Apple', TRUE),
('Samsung Galaxy S24', 'Premium Android smartphone with AI features', 899.99, 45, 1, 'SAMS24-001', 'Samsung', TRUE),
('MacBook Air M2', 'Lightweight laptop with M2 chip and all-day battery', 1199.99, 30, 1, 'MBA-M2-001', 'Apple', TRUE),
('Nike Air Max 270', 'Comfortable running shoes with Air Max technology', 129.99, 100, 2, 'NIKE-AM270-001', 'Nike', TRUE),
('Adidas Ultraboost 22', 'Premium running shoes with Boost midsole', 179.99, 75, 2, 'ADIDAS-UB22-001', 'Adidas', TRUE),
('Garden Tool Set', 'Complete set of essential gardening tools', 89.99, 25, 3, 'GARDEN-TOOLS-001', 'Gardener Pro', TRUE),
('Yoga Mat Premium', 'Non-slip yoga mat with carrying strap', 49.99, 60, 4, 'YOGA-MAT-001', 'ZenLife', TRUE),
('Wireless Bluetooth Headphones', 'Noise-cancelling headphones with 30-hour battery', 199.99, 40, 1, 'BT-HEADPHONES-001', 'SoundMax', TRUE);
