package com.socialapp.controller;

import com.socialapp.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, String>>> healthCheck() {
        Map<String, String> data = new HashMap<>();
        data.put("status", "UP");
        data.put("message", "Backend server is running");
        data.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(ApiResponse.success("Server is healthy", data));
    }

    @GetMapping("/database")
    public ResponseEntity<ApiResponse<Map<String, String>>> databaseCheck() {
        Map<String, String> data = new HashMap<>();
        data.put("status", "Connected");
        data.put("message", "Database connection is active");
        data.put("timestamp", java.time.LocalDateTime.now().toString());
        
        return ResponseEntity.ok(ApiResponse.success("Database connection verified", data));
    }
}

