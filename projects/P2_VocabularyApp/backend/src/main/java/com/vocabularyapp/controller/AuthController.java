package com.vocabularyapp.controller;

import com.vocabularyapp.dto.AuthResponse;
import com.vocabularyapp.dto.LoginRequest;
import com.vocabularyapp.dto.RegisterRequest;
import com.vocabularyapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            AuthResponse authResponse = userService.register(registerRequest);
            
            if (authResponse.isSuccess()) {
                response.put("success", true);
                response.put("message", authResponse.getMessage());
                response.put("token", authResponse.getToken());
                response.put("user", Map.of(
                    "id", authResponse.getUserId(),
                    "email", authResponse.getEmail()
                ));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", authResponse.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Login user
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest loginRequest) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            AuthResponse authResponse = userService.login(loginRequest);
            
            if (authResponse.isSuccess()) {
                response.put("success", true);
                response.put("message", authResponse.getMessage());
                response.put("token", authResponse.getToken());
                response.put("user", Map.of(
                    "id", authResponse.getUserId(),
                    "email", authResponse.getEmail()
                ));
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", authResponse.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Get user profile (requires authentication)
     * GET /api/auth/profile
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract token from Authorization header
            String token = authHeader.replace("Bearer ", "");
            
            // Validate token and get user
            var user = userService.validateTokenAndGetUser(token);
            
            if (user == null) {
                response.put("success", false);
                response.put("message", "Invalid or expired token");
                return ResponseEntity.status(401).body(response);
            }
            
            response.put("success", true);
            response.put("user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "createdAt", user.getCreatedAt()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Profile retrieval failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Test endpoint to verify authentication
     * GET /api/auth/test
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testAuth() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Authentication controller is accessible");
        response.put("timestamp", java.time.LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
