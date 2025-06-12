package com.ecommerce.service;

import com.ecommerce.dto.ProductRequest;
import com.ecommerce.dto.ProductResponse;
import com.ecommerce.model.Category;
import com.ecommerce.model.Product;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    // Create a new product
    public ProductResponse createProduct(ProductRequest request) {
        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
        
        // Check if SKU already exists
        if (request.getSku() != null && productRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("SKU already exists: " + request.getSku());
        }
        
        // Create new product
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setSku(request.getSku());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setBrand(request.getBrand());
        product.setModel(request.getModel());
        product.setIsActive(request.getIsActive());
        
        Product savedProduct = productRepository.save(product);
        return convertToResponse(savedProduct);
    }
    
    // Update an existing product
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + request.getCategoryId()));
        
        // Check if SKU already exists (excluding current product)
        if (request.getSku() != null && productRepository.existsBySkuAndIdNot(request.getSku(), id)) {
            throw new RuntimeException("SKU already exists: " + request.getSku());
        }
        
        // Update product fields
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
        product.setSku(request.getSku());
        product.setWeight(request.getWeight());
        product.setDimensions(request.getDimensions());
        product.setBrand(request.getBrand());
        product.setModel(request.getModel());
        product.setIsActive(request.getIsActive());
        
        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }
    
    // Get product by ID
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        return convertToResponse(product);
    }
    
    // Get all active products with pagination
    public Page<ProductResponse> getAllActiveProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findByIsActiveTrue(pageable);
        
        return products.map(this::convertToResponse);
    }
    
    // Get products by category with pagination
    public Page<ProductResponse> getProductsByCategory(Long categoryId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        
        return products.map(this::convertToResponse);
    }
    
    // Search products
    public Page<ProductResponse> searchProducts(String searchTerm, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findActiveProductsBySearchTerm(searchTerm, pageable);
        
        return products.map(this::convertToResponse);
    }
    
    // Search products by category
    public Page<ProductResponse> searchProductsByCategory(Long categoryId, String searchTerm, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findActiveProductsByCategoryAndSearch(categoryId, searchTerm, pageable);
        
        return products.map(this::convertToResponse);
    }
    
    // Get products by price range
    public Page<ProductResponse> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("price").ascending());
        Page<Product> products = productRepository.findActiveProductsByPriceRange(minPrice, maxPrice, pageable);
        
        return products.map(this::convertToResponse);
    }
    
    // Get products by brand
    public List<ProductResponse> getProductsByBrand(String brand) {
        List<Product> products = productRepository.findByBrandAndIsActiveTrue(brand);
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Get low stock products (for admin alerts)
    public List<ProductResponse> getLowStockProducts() {
        List<Product> products = productRepository.findLowStockProducts();
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Get out of stock products
    public List<ProductResponse> getOutOfStockProducts() {
        List<Product> products = productRepository.findOutOfStockProducts();
        return products.stream().map(this::convertToResponse).collect(Collectors.toList());
    }
    
    // Update stock quantity
    public ProductResponse updateStockQuantity(Long id, Integer newQuantity) {
        if (newQuantity < 0) {
            throw new RuntimeException("Stock quantity cannot be negative");
        }
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        product.setStockQuantity(newQuantity);
        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }
    
    // Toggle product active status
    public ProductResponse toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        product.setIsActive(!product.getIsActive());
        Product updatedProduct = productRepository.save(product);
        return convertToResponse(updatedProduct);
    }
    
    // Delete product (soft delete by setting isActive to false)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
        
        product.setIsActive(false);
        productRepository.save(product);
    }
    
    // Get product count statistics
    public long getTotalActiveProducts() {
        return productRepository.countByIsActiveTrue();
    }
    
    public long getProductsByCategoryCount(Long categoryId) {
        return productRepository.countByCategoryIdAndIsActiveTrue(categoryId);
    }
    
    public long getLowStockProductsCount() {
        return productRepository.countByStockQuantityLessThanEqualAndIsActiveTrue(10);
    }
    
    // Convert Product entity to ProductResponse DTO
    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setStockQuantity(product.getStockQuantity());
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        response.setImageUrl(product.getImageUrl());
        response.setIsActive(product.getIsActive());
        response.setSku(product.getSku());
        response.setWeight(product.getWeight());
        response.setDimensions(product.getDimensions());
        response.setBrand(product.getBrand());
        response.setModel(product.getModel());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        
        // Set computed fields
        response.setInStock(product.isInStock());
        response.setLowStock(product.isLowStock());
        response.setOutOfStock(product.isOutOfStock());
        
        return response;
    }
}
