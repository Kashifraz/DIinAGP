package com.ecommerce.repository;

import com.ecommerce.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Basic find methods
    Optional<Product> findByIdAndIsActiveTrue(Long id);
    List<Product> findByIsActiveTrue();
    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    // Search methods
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Product> findActiveProductsBySearchTerm(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Category-based search
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.id = :categoryId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Product> findActiveProductsByCategoryAndSearch(@Param("categoryId") Long categoryId, 
                                                      @Param("searchTerm") String searchTerm, 
                                                      Pageable pageable);
    
    // Stock management
    List<Product> findByStockQuantityLessThanEqualAndIsActiveTrue(Integer threshold);
    List<Product> findByStockQuantityAndIsActiveTrue(Integer stockQuantity);
    
    // Price range search
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findActiveProductsByPriceRange(@Param("minPrice") BigDecimal minPrice, 
                                               @Param("maxPrice") BigDecimal maxPrice, 
                                               Pageable pageable);
    
    // Brand and model search
    List<Product> findByBrandAndIsActiveTrue(String brand);
    List<Product> findByModelAndIsActiveTrue(String model);
    List<Product> findByBrandAndModelAndIsActiveTrue(String brand, String model);
    
    // SKU validation
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);
    
    // Active products with pagination
    Page<Product> findByIsActiveTrue(Pageable pageable);
    
    // Category-based pagination
    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    
    // Sort by various criteria
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.createdAt DESC")
    List<Product> findActiveProductsOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.price ASC")
    List<Product> findActiveProductsOrderByPriceAsc();
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.price DESC")
    List<Product> findActiveProductsOrderByPriceDesc();
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.name ASC")
    List<Product> findActiveProductsOrderByNameAsc();
    
    // Count methods
    long countByIsActiveTrue();
    long countByCategoryIdAndIsActiveTrue(Long categoryId);
    long countByStockQuantityLessThanEqualAndIsActiveTrue(Integer threshold);
    
    // Find products by multiple categories
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.id IN :categoryIds")
    List<Product> findActiveProductsByCategoryIds(@Param("categoryIds") List<Long> categoryIds);
    
    // Find products with low stock (for admin alerts)
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stockQuantity <= 10 ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockProducts();
    
    // Find out-of-stock products
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.stockQuantity = 0")
    List<Product> findOutOfStockProducts();
}
