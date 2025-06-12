package com.lms.service;

import com.lms.dto.CourseDTO;
import com.lms.dto.CreateCourseRequest;
import com.lms.dto.UpdateCourseRequest;
import com.lms.entity.Course;
import com.lms.entity.CourseMajor;
import com.lms.entity.User;
import com.lms.repository.CourseMajorRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseMajorRepository courseMajorRepository;
    private final UserRepository userRepository;

    @Transactional
    public CourseDTO createCourse(CreateCourseRequest request, Long coordinatorId) {
        // Check if course code already exists
        if (courseRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Course with code '" + request.getCode() + "' already exists");
        }

        // Get major
        CourseMajor major = courseMajorRepository.findById(request.getMajorId())
                .orElseThrow(() -> new RuntimeException("Major not found with id: " + request.getMajorId()));

        // Verify coordinator owns this major
        if (!major.getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to create courses in this major");
        }

        // Get professor if provided
        User professor = null;
        if (request.getProfessorId() != null) {
            professor = userRepository.findById(request.getProfessorId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getProfessorId()));
            
            // Verify professor role
            if (!professor.getRole().equals(User.Role.PROFESSOR)) {
                throw new RuntimeException("User with id " + request.getProfessorId() + " is not a professor. Please provide a valid professor ID.");
            }
        }

        // Create course
        Course course = new Course();
        course.setCode(request.getCode());
        course.setName(request.getName());
        course.setDescription(request.getDescription());
        course.setMajor(major);
        course.setProfessor(professor);
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());
        course.setCreditHours(request.getCreditHours() != null ? request.getCreditHours() : 0);
        course.setStatus(Course.Status.ACTIVE);

        course = courseRepository.save(course);
        return convertToDTO(course);
    }

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesByMajor(Long majorId) {
        return courseRepository.findByMajorId(majorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        return convertToDTO(course);
    }

    @Transactional
    public CourseDTO updateCourse(Long id, UpdateCourseRequest request, Long coordinatorId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Verify coordinator owns the major
        if (!course.getMajor().getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to update this course");
        }

        // Update code if provided and check uniqueness
        if (request.getCode() != null && !request.getCode().equals(course.getCode())) {
            if (courseRepository.existsByCode(request.getCode())) {
                throw new RuntimeException("Course with code '" + request.getCode() + "' already exists");
            }
            course.setCode(request.getCode());
        }

        // Update other fields
        if (request.getName() != null) {
            course.setName(request.getName());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getMajorId() != null) {
            CourseMajor major = courseMajorRepository.findById(request.getMajorId())
                    .orElseThrow(() -> new RuntimeException("Major not found with id: " + request.getMajorId()));
            // Verify coordinator owns the new major
            if (!major.getCoordinator().getId().equals(coordinatorId)) {
                throw new RuntimeException("You don't have permission to assign courses to this major");
            }
            course.setMajor(major);
        }
        if (request.getStartDate() != null) {
            course.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            course.setEndDate(request.getEndDate());
        }
        if (request.getCreditHours() != null) {
            course.setCreditHours(request.getCreditHours());
        }
        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());
        }

        course = courseRepository.save(course);
        return convertToDTO(course);
    }

    @Transactional
    public CourseDTO assignProfessor(Long id, Long professorId, Long coordinatorId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        // Verify coordinator owns the major
        if (!course.getMajor().getCoordinator().getId().equals(coordinatorId)) {
            throw new RuntimeException("You don't have permission to assign professors to this course");
        }

        // Get professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + professorId));

        // Verify professor role
        if (!professor.getRole().equals(User.Role.PROFESSOR)) {
            throw new RuntimeException("User with id " + professorId + " is not a professor. Please provide a valid professor ID.");
        }

        course.setProfessor(professor);
        course = courseRepository.save(course);
        return convertToDTO(course);
    }

    public List<CourseDTO> getCoursesByProfessor(Long professorId) {
        return courseRepository.findByProfessorId(professorId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setCode(course.getCode());
        dto.setName(course.getName());
        dto.setDescription(course.getDescription());
        dto.setMajorId(course.getMajor().getId());
        dto.setMajorName(course.getMajor().getName());
        dto.setProfessorId(course.getProfessor() != null ? course.getProfessor().getId() : null);
        dto.setProfessorName(course.getProfessor() != null 
            ? course.getProfessor().getFirstName() + " " + course.getProfessor().getLastName() 
            : null);
        dto.setStartDate(course.getStartDate());
        dto.setEndDate(course.getEndDate());
        dto.setCreditHours(course.getCreditHours());
        dto.setStatus(course.getStatus());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());
        return dto;
    }
}

