package com.lms.service;

import com.lms.dto.CourseContentDTO;
import com.lms.entity.ContentModule;
import com.lms.entity.Course;
import com.lms.entity.CourseContent;
import com.lms.entity.User;
import com.lms.repository.ContentModuleRepository;
import com.lms.repository.CourseContentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseContentService {

    private final CourseContentRepository contentRepository;
    private final ContentModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final List<String> ALLOWED_FILE_TYPES = List.of(
            "application/pdf",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "video/mp4",
            "video/quicktime"
    );

    @Transactional
    public CourseContentDTO uploadContent(Long moduleId, String title, String description, MultipartFile file, Long professorId) throws IOException {
        // Get module
        ContentModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

        // Verify professor is assigned to this course
        if (module.getCourse().getProfessor() == null || !module.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to upload content to this module");
        }

        // Validate file
        validateFile(file);

        // Get professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + professorId));

        // Store file
        String filePath = fileStorageService.storeFile(file, module.getCourse().getId(), moduleId);

        // Determine file type
        CourseContent.FileType fileType = determineFileType(file.getContentType(), file.getOriginalFilename());

        // Create content
        CourseContent content = new CourseContent();
        content.setModule(module);
        content.setCourse(module.getCourse());
        content.setTitle(title);
        content.setDescription(description);
        content.setContentType(CourseContent.ContentType.FILE);
        content.setFilePath(filePath);
        content.setFileType(fileType);
        content.setFileSize(file.getSize());
        content.setUploader(professor);
        content.setDisplayOrder(0);

        content = contentRepository.save(content);
        return convertToDTO(content);
    }

    @Transactional
    public CourseContentDTO addLink(Long moduleId, String title, String description, String url, Long professorId) {
        // Get module
        ContentModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

        // Verify professor is assigned to this course
        if (module.getCourse().getProfessor() == null || !module.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to add content to this module");
        }

        // Get professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + professorId));

        // Create content
        CourseContent content = new CourseContent();
        content.setModule(module);
        content.setCourse(module.getCourse());
        content.setTitle(title);
        content.setDescription(description);
        content.setContentType(CourseContent.ContentType.LINK);
        content.setFileUrl(url);
        content.setFileType(CourseContent.FileType.LINK);
        content.setUploader(professor);
        content.setDisplayOrder(0);

        content = contentRepository.save(content);
        return convertToDTO(content);
    }

    public List<CourseContentDTO> getContentByModule(Long moduleId) {
        List<CourseContent> contents = contentRepository.findByModuleIdOrderByDisplayOrderAsc(moduleId);
        return contents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseContentDTO> getContentByCourse(Long courseId) {
        List<CourseContent> contents = contentRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        return contents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CourseContentDTO getContentById(Long contentId) {
        CourseContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found with id: " + contentId));
        return convertToDTO(content);
    }

    @Transactional
    public void deleteContent(Long contentId, Long professorId) throws IOException {
        CourseContent content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found with id: " + contentId));

        // Verify professor is assigned to this course
        if (content.getCourse().getProfessor() == null || !content.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to delete this content");
        }

        // Delete file if it exists
        if (content.getFilePath() != null) {
            fileStorageService.deleteFile(content.getFilePath());
        }

        contentRepository.delete(content);
    }

    @Transactional
    public void reorderContent(Long moduleId, List<Long> contentIds, Long professorId) {
        // Get module
        ContentModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

        // Verify professor is assigned to this course
        if (module.getCourse().getProfessor() == null || !module.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to reorder content for this module");
        }

        // Update display order
        for (int i = 0; i < contentIds.size(); i++) {
            final int orderIndex = i;
            final Long contentId = contentIds.get(i);
            CourseContent content = contentRepository.findById(contentId)
                    .orElseThrow(() -> new RuntimeException("Content not found with id: " + contentId));
            content.setDisplayOrder(orderIndex);
            contentRepository.save(content);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is required");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum allowed size of 100MB");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_FILE_TYPES.contains(contentType)) {
            throw new RuntimeException("File type not allowed. Allowed types: PDF, PPT, DOC, MP4");
        }
    }

    private CourseContent.FileType determineFileType(String contentType, String filename) {
        if (contentType == null) {
            return CourseContent.FileType.DOC;
        }

        if (contentType.contains("pdf")) {
            return CourseContent.FileType.PDF;
        } else if (contentType.contains("presentation") || contentType.contains("powerpoint") || 
                   (filename != null && filename.toLowerCase().endsWith(".ppt"))) {
            return CourseContent.FileType.PPT;
        } else if (contentType.contains("word") || contentType.contains("document") ||
                   (filename != null && (filename.toLowerCase().endsWith(".doc") || filename.toLowerCase().endsWith(".docx")))) {
            return CourseContent.FileType.DOC;
        } else if (contentType.contains("video")) {
            return CourseContent.FileType.VIDEO;
        }

        return CourseContent.FileType.DOC;
    }

    private CourseContentDTO convertToDTO(CourseContent content) {
        CourseContentDTO dto = new CourseContentDTO();
        dto.setId(content.getId());
        dto.setModuleId(content.getModule().getId());
        dto.setModuleName(content.getModule().getName());
        dto.setCourseId(content.getCourse().getId());
        dto.setCourseName(content.getCourse().getName());
        dto.setCourseCode(content.getCourse().getCode());
        dto.setTitle(content.getTitle());
        dto.setDescription(content.getDescription());
        dto.setContentType(content.getContentType().name());
        dto.setFilePath(content.getFilePath());
        dto.setFileUrl(content.getFileUrl());
        dto.setFileType(content.getFileType() != null ? content.getFileType().name() : null);
        dto.setFileSize(content.getFileSize());
        dto.setUploaderId(content.getUploader().getId());
        dto.setUploaderName(content.getUploader().getFirstName() + " " + content.getUploader().getLastName());
        dto.setDisplayOrder(content.getDisplayOrder());
        dto.setCreatedAt(content.getCreatedAt());
        dto.setUpdatedAt(content.getUpdatedAt());
        return dto;
    }
}

