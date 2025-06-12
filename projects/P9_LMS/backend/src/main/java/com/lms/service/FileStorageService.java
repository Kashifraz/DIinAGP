package com.lms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file, Long courseId, Long moduleId) throws IOException {
        // Create directory structure: uploads/course/{courseId}/module/{moduleId}/
        Path courseDir = Paths.get(uploadDir, "course", String.valueOf(courseId), "module", String.valueOf(moduleId));
        Files.createDirectories(courseDir);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        // Save file
        Path targetLocation = courseDir.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return targetLocation.toString().replace("\\", "/");
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }

    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }

    public String storeSubmissionFile(MultipartFile file, Long courseId, Long assessmentId, Long studentId) throws IOException {
        // Create directory structure: uploads/course/{courseId}/assessment/{assessmentId}/submission/{studentId}/
        Path submissionDir = Paths.get(uploadDir, "course", String.valueOf(courseId), "assessment", String.valueOf(assessmentId), "submission", String.valueOf(studentId));
        Files.createDirectories(submissionDir);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        // Save file
        Path targetLocation = submissionDir.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return targetLocation.toString().replace("\\", "/");
    }
}

