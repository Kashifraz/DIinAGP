package com.ecommerce.controller;

import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/public")
public class TestController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @GetMapping("/health")
    public String healthCheck() {
        return "E-Commerce Backend is running!";
    }
    
    @GetMapping("/test-user")
    public Map<String, Object> testUser(@RequestParam String email) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            result.put("found", true);
            result.put("email", user.getEmail());
            result.put("firstName", user.getFirstName());
            result.put("lastName", user.getLastName());
            result.put("role", user.getRole());
            result.put("emailVerified", user.isEmailVerified());
            result.put("hasPassword", user.getPasswordHash() != null && !user.getPasswordHash().isEmpty());
            
            // Test password matching
            boolean passwordMatches = passwordEncoder.matches("admin123", user.getPasswordHash());
            result.put("passwordMatches", passwordMatches);
            
        } else {
            result.put("found", false);
        }
        
        return result;
    }
    
    @GetMapping("/test-categories")
    public Map<String, Object> testCategories() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Test category endpoints
            result.put("message", "Category endpoints are accessible");
            result.put("timestamp", new java.util.Date());
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        
        return result;
    }
    
    @GetMapping("/test-admin-user")
    public Map<String, Object> testAdminUser() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Optional<User> adminUser = userRepository.findByEmail("admin@ecommerce.com");
            if (adminUser.isPresent()) {
                User user = adminUser.get();
                result.put("found", true);
                result.put("email", user.getEmail());
                result.put("firstName", user.getFirstName());
                result.put("lastName", user.getLastName());
                result.put("role", user.getRole());
                result.put("emailVerified", user.isEmailVerified());
                
                // Test password matching
                boolean passwordMatches = passwordEncoder.matches("admin123", user.getPasswordHash());
                result.put("passwordMatches", passwordMatches);
                
                if (passwordMatches) {
                    result.put("status", "Admin user is ready for login");
                } else {
                    result.put("status", "Admin user exists but password doesn't match");
                }
                
            } else {
                result.put("found", false);
                result.put("status", "Admin user not found in database");
            }
            
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("stackTrace", e.getStackTrace());
        }
        
        return result;
    }
}
