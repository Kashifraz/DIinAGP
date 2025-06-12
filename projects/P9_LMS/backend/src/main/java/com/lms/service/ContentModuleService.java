package com.lms.service;

import com.lms.dto.ContentModuleDTO;
import com.lms.dto.CourseContentDTO;
import com.lms.dto.CreateModuleRequest;
import com.lms.dto.UpdateModuleRequest;
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

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContentModuleService {

    private final ContentModuleRepository moduleRepository;
    private final CourseContentRepository contentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public ContentModuleDTO createModule(CreateModuleRequest request, Long professorId) {
        // Get course
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + request.getCourseId()));

        // Verify professor is assigned to this course
        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to create modules for this course");
        }

        // Create module
        ContentModule module = new ContentModule();
        module.setCourse(course);
        module.setName(request.getName());
        module.setDescription(request.getDescription());
        module.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        module = moduleRepository.save(module);
        return convertToDTO(module);
    }

    public List<ContentModuleDTO> getModulesByCourse(Long courseId) {
        List<ContentModule> modules = moduleRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        return modules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ContentModuleDTO getModuleById(Long moduleId) {
        ContentModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));
        return convertToDTO(module);
    }

    @Transactional
    public ContentModuleDTO updateModule(Long moduleId, UpdateModuleRequest request, Long professorId) {
        ContentModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

        // Verify professor is assigned to this course
        if (module.getCourse().getProfessor() == null || !module.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to update this module");
        }

        if (request.getName() != null) {
            module.setName(request.getName());
        }
        if (request.getDescription() != null) {
            module.setDescription(request.getDescription());
        }
        if (request.getDisplayOrder() != null) {
            module.setDisplayOrder(request.getDisplayOrder());
        }

        module = moduleRepository.save(module);
        return convertToDTO(module);
    }

    @Transactional
    public void deleteModule(Long moduleId, Long professorId) {
        ContentModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));

        // Verify professor is assigned to this course
        if (module.getCourse().getProfessor() == null || !module.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to delete this module");
        }

        moduleRepository.delete(module);
    }

    @Transactional
    public void reorderModules(Long courseId, List<Long> moduleIds, Long professorId) {
        // Verify professor is assigned to this course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to reorder modules for this course");
        }

        // Update display order
        for (int i = 0; i < moduleIds.size(); i++) {
            final int orderIndex = i;
            final Long moduleId = moduleIds.get(i);
            ContentModule module = moduleRepository.findById(moduleId)
                    .orElseThrow(() -> new RuntimeException("Module not found with id: " + moduleId));
            module.setDisplayOrder(orderIndex);
            moduleRepository.save(module);
        }
    }

    private ContentModuleDTO convertToDTO(ContentModule module) {
        ContentModuleDTO dto = new ContentModuleDTO();
        dto.setId(module.getId());
        dto.setCourseId(module.getCourse().getId());
        dto.setCourseName(module.getCourse().getName());
        dto.setCourseCode(module.getCourse().getCode());
        dto.setName(module.getName());
        dto.setDescription(module.getDescription());
        dto.setDisplayOrder(module.getDisplayOrder());
        dto.setCreatedAt(module.getCreatedAt());
        dto.setUpdatedAt(module.getUpdatedAt());
        
        // Fetch and populate contents for this module
        List<CourseContent> contents = contentRepository.findByModuleIdOrderByDisplayOrderAsc(module.getId());
        if (contents != null && !contents.isEmpty()) {
            dto.setContents(contents.stream()
                    .map(this::convertContentToDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setContents(new ArrayList<>());
        }
        
        return dto;
    }
    
    private CourseContentDTO convertContentToDTO(CourseContent content) {
        CourseContentDTO dto = new CourseContentDTO();
        dto.setId(content.getId());
        dto.setModuleId(content.getModule().getId());
        dto.setModuleName(content.getModule().getName());
        dto.setCourseId(content.getCourse().getId());
        dto.setCourseCode(content.getCourse().getCode());
        dto.setCourseName(content.getCourse().getName());
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

