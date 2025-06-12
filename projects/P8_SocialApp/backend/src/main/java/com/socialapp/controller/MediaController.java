package com.socialapp.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private static final String PROFILE_UPLOAD_DIR = "uploads/profiles/";
    private static final String POST_UPLOAD_DIR = "uploads/posts/";

    @GetMapping("/profile-photo/{filename}")
    public ResponseEntity<Resource> getProfilePhoto(@PathVariable String filename) {
        return getImage(PROFILE_UPLOAD_DIR, filename);
    }

    @GetMapping("/post-image/{filename}")
    public ResponseEntity<Resource> getPostImage(@PathVariable String filename) {
        return getImage(POST_UPLOAD_DIR, filename);
    }

    private ResponseEntity<Resource> getImage(String uploadDir, String filename) {
        try {
            // URL decode the filename first
            String decodedFilename = java.net.URLDecoder.decode(filename, java.nio.charset.StandardCharsets.UTF_8);
            
            // Security: Extract just the filename to prevent path traversal attacks
            // Handle cases where filename might contain path separators
            String safeFilename = decodedFilename;
            if (safeFilename.contains("/") || safeFilename.contains("\\")) {
                // Extract just the last part after any path separators
                int lastSlash = Math.max(safeFilename.lastIndexOf("/"), safeFilename.lastIndexOf("\\"));
                if (lastSlash >= 0) {
                    safeFilename = safeFilename.substring(lastSlash + 1);
                }
            }
            
            // Remove any null bytes or control characters
            safeFilename = safeFilename.replaceAll("[\\x00-\\x1F\\x7F]", "");
            
            // Prevent path traversal
            if (safeFilename.contains("..") || safeFilename.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            
            Path filePath = Paths.get(uploadDir).resolve(safeFilename).normalize();
            
            // Additional security: Ensure the resolved path is within the upload directory
            Path uploadDirPath = Paths.get(uploadDir).normalize().toAbsolutePath();
            if (!filePath.toAbsolutePath().startsWith(uploadDirPath)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            
            File file = filePath.toFile();

            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String contentType = Files.probeContentType(filePath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

