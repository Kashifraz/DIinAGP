package com.ecommerce.service;

import com.ecommerce.dto.CategoryRequest;
import com.ecommerce.dto.CategoryResponse;
import com.ecommerce.model.Category;
import com.ecommerce.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    // Get all categories (admin only)
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        // Sort by sort order manually
        categories.sort((c1, c2) -> {
            Integer order1 = c1.getSortOrder() != null ? c1.getSortOrder() : 0;
            Integer order2 = c2.getSortOrder() != null ? c2.getSortOrder() : 0;
            return order1.compareTo(order2);
        });
        return categories.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get all active categories (public)
    public List<CategoryResponse> getActiveCategories() {
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderBySortOrderAsc();
        return categories.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Get category by ID
    public Optional<CategoryResponse> getCategoryById(Long id) {
        Optional<Category> category = categoryRepository.findById(id);
        return category.map(this::convertToResponse);
    }
    
    // Get category by name
    public Optional<CategoryResponse> getCategoryByName(String name) {
        Optional<Category> category = categoryRepository.findByNameIgnoreCase(name);
        return category.map(this::convertToResponse);
    }
    
    // Search categories by name
    public List<CategoryResponse> searchCategories(String searchTerm) {
        List<Category> categories = categoryRepository.findActiveCategoriesByNameContaining(searchTerm);
        return categories.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    // Create new category
    public CategoryResponse createCategory(CategoryRequest request) {
        // Check if name already exists
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
        }
        
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        
        Category savedCategory = categoryRepository.save(category);
        return convertToResponse(savedCategory);
    }
    
    // Update existing category
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Optional<Category> existingCategory = categoryRepository.findById(id);
        if (existingCategory.isEmpty()) {
            throw new IllegalArgumentException("Category with ID " + id + " not found");
        }
        
        Category category = existingCategory.get();
        
        // Check if name already exists (excluding current category)
        if (!category.getName().equalsIgnoreCase(request.getName()) && 
            categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Category with name '" + request.getName() + "' already exists");
        }
        
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : category.getIsActive());
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : category.getSortOrder());
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToResponse(updatedCategory);
    }
    
    // Delete category
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new IllegalArgumentException("Category with ID " + id + " not found");
        }
        
        // TODO: Check if category has products before deleting
        // For now, we'll just delete it
        categoryRepository.deleteById(id);
    }
    
    // Toggle category active status
    public CategoryResponse toggleCategoryStatus(Long id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Category with ID " + id + " not found");
        }
        
        Category category = categoryOpt.get();
        category.setIsActive(!category.getIsActive());
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToResponse(updatedCategory);
    }
    
    // Update category sort order
    public CategoryResponse updateCategorySortOrder(Long id, Integer newSortOrder) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Category with ID " + id + " not found");
        }
        
        Category category = categoryOpt.get();
        category.setSortOrder(newSortOrder);
        
        Category updatedCategory = categoryRepository.save(category);
        return convertToResponse(updatedCategory);
    }
    
    // Get category count
    public long getCategoryCount() {
        return categoryRepository.count();
    }
    
    // Get active category count
    public long getActiveCategoryCount() {
        return categoryRepository.countByIsActiveTrue();
    }
    
    // Convert Category entity to CategoryResponse DTO
    private CategoryResponse convertToResponse(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getDescription(),
            category.getImageUrl(),
            category.getIsActive(),
            category.getSortOrder(),
            category.getCreatedAt(),
            category.getUpdatedAt()
        );
    }
}
