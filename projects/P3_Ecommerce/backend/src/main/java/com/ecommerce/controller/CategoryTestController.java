package com.ecommerce.controller;

import com.ecommerce.dto.CategoryRequest;
import com.ecommerce.dto.CategoryResponse;
import com.ecommerce.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/test/categories")
@CrossOrigin(origins = "*")
public class CategoryTestController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "Category service is running");
        result.put("timestamp", new java.util.Date());
        return result;
    }
    
    @GetMapping("/test-public-endpoints")
    public Map<String, Object> testPublicEndpoints() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Test getting active categories
            List<CategoryResponse> activeCategories = categoryService.getActiveCategories();
            result.put("activeCategoriesCount", activeCategories.size());
            result.put("activeCategories", activeCategories);
            
            // Test getting all categories (this should work for testing)
            List<CategoryResponse> allCategories = categoryService.getAllCategories();
            result.put("totalCategoriesCount", allCategories.size());
            result.put("allCategories", allCategories);
            
            result.put("success", true);
            result.put("message", "Public endpoints test completed successfully");
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("stackTrace", e.getStackTrace());
        }
        
        return result;
    }
    
    @PostMapping("/test-create")
    public ResponseEntity<?> testCreateCategory() {
        try {
            CategoryRequest request = new CategoryRequest();
            request.setName("Test Category " + System.currentTimeMillis());
            request.setDescription("This is a test category for testing purposes");
            request.setSortOrder(999);
            
            CategoryResponse category = categoryService.createCategory(request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Test category created successfully");
            result.put("category", category);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
    
    @GetMapping("/test-search")
    public Map<String, Object> testSearch(@RequestParam(defaultValue = "Electronics") String searchTerm) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<CategoryResponse> searchResults = categoryService.searchCategories(searchTerm);
            result.put("searchTerm", searchTerm);
            result.put("resultsCount", searchResults.size());
            result.put("searchResults", searchResults);
            result.put("success", true);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    @GetMapping("/test-stats")
    public Map<String, Object> testStats() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            long totalCategories = categoryService.getCategoryCount();
            long activeCategories = categoryService.getActiveCategoryCount();
            
            result.put("totalCategories", totalCategories);
            result.put("activeCategories", activeCategories);
            result.put("inactiveCategories", totalCategories - activeCategories);
            result.put("success", true);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
}
