package com.lms.controller;

import com.lms.dto.CourseContentDTO;
import com.lms.dto.ReorderContentRequest;
import com.lms.repository.UserRepository;
import com.lms.service.CourseContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/content")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CourseContentController {

    private final CourseContentService contentService;
    private final UserRepository userRepository;

    @PostMapping("/module/{moduleId}/upload")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<CourseContentDTO> uploadContent(
            @PathVariable Long moduleId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) throws IOException {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        CourseContentDTO content = contentService.uploadContent(moduleId, title, description, file, professorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(content);
    }

    @PostMapping("/module/{moduleId}/link")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<CourseContentDTO> addLink(
            @PathVariable Long moduleId,
            @RequestParam("title") String title,
            @RequestParam("url") String url,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        CourseContentDTO content = contentService.addLink(moduleId, title, description, url, professorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(content);
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<CourseContentDTO>> getContentByModule(@PathVariable Long moduleId) {
        List<CourseContentDTO> contents = contentService.getContentByModule(moduleId);
        return ResponseEntity.ok(contents);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_STUDENT', 'ROLE_COORDINATOR')")
    public ResponseEntity<List<CourseContentDTO>> getContentByCourse(@PathVariable Long courseId) {
        List<CourseContentDTO> contents = contentService.getContentByCourse(courseId);
        return ResponseEntity.ok(contents);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_STUDENT', 'ROLE_COORDINATOR')")
    public ResponseEntity<CourseContentDTO> getContentById(@PathVariable Long id) {
        CourseContentDTO content = contentService.getContentById(id);
        return ResponseEntity.ok(content);
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyAuthority('ROLE_PROFESSOR', 'ROLE_STUDENT', 'ROLE_COORDINATOR')")
    public ResponseEntity<Resource> downloadContent(@PathVariable Long id) throws IOException {
        CourseContentDTO content = contentService.getContentById(id);
        
        if (content.getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(content.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        // Extract file extension from file path
        String filename = content.getTitle();
        String filePathStr = content.getFilePath();
        if (filePathStr != null && filePathStr.contains(".")) {
            String extension = filePathStr.substring(filePathStr.lastIndexOf("."));
            // Only add extension if filename doesn't already have it
            if (!filename.toLowerCase().endsWith(extension.toLowerCase())) {
                filename = filename + extension;
            }
        }

        // Determine content type based on file type
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        if (content.getFileType() != null) {
            switch (content.getFileType().toUpperCase()) {
                case "PDF":
                    mediaType = MediaType.APPLICATION_PDF;
                    break;
                case "PPT":
                case "PPTX":
                    mediaType = MediaType.valueOf("application/vnd.ms-powerpoint");
                    break;
                case "DOC":
                case "DOCX":
                    mediaType = MediaType.valueOf("application/msword");
                    break;
                case "VIDEO":
                case "MP4":
                    mediaType = MediaType.valueOf("video/mp4");
                    break;
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> deleteContent(
            @PathVariable Long id,
            Authentication authentication) throws IOException {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        contentService.deleteContent(id, professorId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/module/{moduleId}/reorder")
    @PreAuthorize("hasAuthority('ROLE_PROFESSOR')")
    public ResponseEntity<Void> reorderContent(
            @PathVariable Long moduleId,
            @Valid @RequestBody ReorderContentRequest request,
            Authentication authentication) {
        
        Long professorId = getUserIdFromAuthentication(authentication);
        contentService.reorderContent(moduleId, request.getContentIds(), professorId);
        return ResponseEntity.ok().build();
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}

