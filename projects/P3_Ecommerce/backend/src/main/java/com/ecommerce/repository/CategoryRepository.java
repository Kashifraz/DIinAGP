package com.ecommerce.repository;

import com.ecommerce.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Find by name (case-insensitive)
    Optional<Category> findByNameIgnoreCase(String name);
    
    // Find all active categories
    List<Category> findByIsActiveTrue();
    
    // Find all active categories ordered by sort order
    List<Category> findByIsActiveTrueOrderBySortOrderAsc();
    
    // Check if name exists (case-insensitive)
    boolean existsByNameIgnoreCase(String name);
    
    // Check if name exists excluding current category (for updates)
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    
    // Find categories by name containing (for search)
    @Query("SELECT c FROM Category c WHERE c.isActive = true AND LOWER(c.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.sortOrder ASC")
    List<Category> findActiveCategoriesByNameContaining(@Param("searchTerm") String searchTerm);
    
    // Count active categories
    long countByIsActiveTrue();
}
