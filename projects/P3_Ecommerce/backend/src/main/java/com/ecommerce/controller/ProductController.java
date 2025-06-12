package com.ecommerce.controller;

import com.ecommerce.dto.ProductRequest;
import com.ecommerce.dto.ProductResponse;
import com.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    // Public endpoints (no authentication required)
    
    @GetMapping("/public/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        try {
            ProductResponse product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/public")
    public ResponseEntity<Page<ProductResponse>> getAllActiveProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<ProductResponse> products = productService.getAllActiveProducts(page, size, sortBy, sortDir);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/public/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<ProductResponse> products = productService.getProductsByCategory(categoryId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/public/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<ProductResponse> products = productService.searchProducts(q, page, size, sortBy, sortDir);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/public/search/category/{categoryId}")
    public ResponseEntity<Page<ProductResponse>> searchProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<ProductResponse> products = productService.searchProductsByCategory(categoryId, q, page, size, sortBy, sortDir);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/public/price-range")
    public ResponseEntity<Page<ProductResponse>> getProductsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Page<ProductResponse> products = productService.getProductsByPriceRange(minPrice, maxPrice, page, size);
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/public/brand/{brand}")
    public ResponseEntity<List<ProductResponse>> getProductsByBrand(@PathVariable String brand) {
        List<ProductResponse> products = productService.getProductsByBrand(brand);
        return ResponseEntity.ok(products);
    }
    
    // Admin endpoints (require ADMIN role)
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        try {
            ProductResponse product = productService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id, 
            @Valid @RequestBody ProductRequest request) {
        try {
            ProductResponse product = productService.updateProduct(id, request);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateStockQuantity(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> request) {
        try {
            Integer newQuantity = request.get("stockQuantity");
            if (newQuantity == null) {
                return ResponseEntity.badRequest().build();
            }
            
            ProductResponse product = productService.updateStockQuantity(id, newQuantity);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> toggleProductStatus(@PathVariable Long id) {
        try {
            ProductResponse product = productService.toggleProductStatus(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Admin analytics endpoints
    
    @GetMapping("/admin/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        List<ProductResponse> products = productService.getLowStockProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/admin/out-of-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts() {
        List<ProductResponse> products = productService.getOutOfStockProducts();
        return ResponseEntity.ok(products);
    }
    
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getProductStats() {
        Map<String, Long> stats = Map.of(
            "totalActiveProducts", productService.getTotalActiveProducts(),
            "lowStockProducts", productService.getLowStockProductsCount()
        );
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/admin/stats/category/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getCategoryProductStats(@PathVariable Long categoryId) {
        long count = productService.getProductsByCategoryCount(categoryId);
        Map<String, Long> stats = Map.of("productCount", count);
        return ResponseEntity.ok(stats);
    }
}
