package com.ecommerce.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @PostConstruct
    public void init() {
        // Create upload directory if it doesn't exist
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Upload controller is working! Upload dir: " + uploadDir);
    }

    @PostMapping("/image")
    // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        try {
            System.out.println("Upload endpoint called with file: " + file.getOriginalFilename());
            System.out.println("Upload directory: " + uploadDir);
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            System.out.println("Upload path: " + uploadPath.toAbsolutePath());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory");
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Return the image URL
            String imageUrl = "/api/uploads/" + filename;
            return ResponseEntity.ok(new ImageUploadResponse(imageUrl));

        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to upload image: " + e.getMessage());
        }
    }

    @DeleteMapping("/image")
    // @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
    public ResponseEntity<?> deleteImage(@RequestBody ImageDeleteRequest request) {
        try {
            String imageUrl = request.getImageUrl();
            if (imageUrl != null && imageUrl.startsWith("/api/uploads/")) {
                String filename = imageUrl.substring("/api/uploads/".length());
                Path filePath = Paths.get(uploadDir, filename);
                
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    return ResponseEntity.ok().body("Image deleted successfully");
                }
            }
            return ResponseEntity.badRequest().body("Invalid image URL");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Failed to delete image: " + e.getMessage());
        }
    }

    // Static inner classes for request/response
    public static class ImageUploadResponse {
        private String imageUrl;

        public ImageUploadResponse(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }

    public static class ImageDeleteRequest {
        private String imageUrl;

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}
