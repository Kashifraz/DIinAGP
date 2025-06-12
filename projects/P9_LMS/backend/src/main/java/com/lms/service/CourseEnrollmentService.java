package com.lms.service;

import com.lms.dto.BulkEnrollmentRequest;
import com.lms.dto.EnrollmentDTO;
import com.lms.entity.Course;
import com.lms.entity.CourseEnrollment;
import com.lms.entity.User;
import com.lms.repository.CourseEnrollmentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseEnrollmentService {

    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Transactional
    public EnrollmentDTO enrollStudent(Long courseId, Long studentId, Long coordinatorId) {
        // Get coordinator
        User coordinator = userRepository.findById(coordinatorId)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with id: " + coordinatorId));

        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Verify course is active
        if (!course.getStatus().equals(Course.Status.ACTIVE)) {
            throw new RuntimeException("Cannot enroll students in an archived course");
        }

        // Verify coordinator has permission (must be coordinator of the course's major)
        if (!course.getMajor().getCoordinator().getId().equals(coordinator.getId())) {
            throw new RuntimeException("You don't have permission to enroll students in this course");
        }

        // Get student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Verify student role
        if (!student.getRole().equals(User.Role.STUDENT)) {
            throw new RuntimeException("User with id " + studentId + " is not a student");
        }

        // Check if already enrolled (only check for ACTIVE enrollments)
        Optional<CourseEnrollment> existingEnrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        
        if (existingEnrollment.isPresent()) {
            CourseEnrollment enrollment = existingEnrollment.get();
            
            // If enrollment is ACTIVE, prevent duplicate
            if (enrollment.getStatus().equals(CourseEnrollment.Status.ACTIVE)) {
                throw new RuntimeException("Student is already enrolled in this course");
            }
            
            // If enrollment is DROPPED or COMPLETED, reactivate it
            enrollment.setStatus(CourseEnrollment.Status.ACTIVE);
            enrollment.setEnrollmentDate(LocalDate.now()); // Update enrollment date
            enrollment = enrollmentRepository.save(enrollment);
            return convertToDTO(enrollment);
        }

        // Create new enrollment
        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setCourse(course);
        enrollment.setStudent(student);
        enrollment.setEnrollmentDate(LocalDate.now());
        enrollment.setStatus(CourseEnrollment.Status.ACTIVE);

        enrollment = enrollmentRepository.save(enrollment);
        return convertToDTO(enrollment);
    }

    @Transactional
    public List<EnrollmentDTO> bulkEnrollStudents(BulkEnrollmentRequest request, Long coordinatorId) {
        List<EnrollmentDTO> enrollments = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long studentId : request.getStudentIds()) {
            try {
                EnrollmentDTO enrollment = enrollStudent(request.getCourseId(), studentId, coordinatorId);
                enrollments.add(enrollment);
            } catch (RuntimeException e) {
                errors.add("Student " + studentId + ": " + e.getMessage());
            }
        }

        if (enrollments.isEmpty() && !errors.isEmpty()) {
            throw new RuntimeException("Failed to enroll any students. Errors: " + String.join("; ", errors));
        }

        return enrollments;
    }

    public List<EnrollmentDTO> getEnrollmentsByCourse(Long courseId) {
        List<CourseEnrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        return enrollments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EnrollmentDTO> getEnrollmentsByStudent(Long studentId) {
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        return enrollments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void dropEnrollment(Long enrollmentId, Long coordinatorId) {
        // Get coordinator
        User coordinator = userRepository.findById(coordinatorId)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with id: " + coordinatorId));

        // Get enrollment
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found with id: " + enrollmentId));

        // Verify coordinator has permission
        if (!enrollment.getCourse().getMajor().getCoordinator().getId().equals(coordinator.getId())) {
            throw new RuntimeException("You don't have permission to drop this enrollment");
        }

        // Update status to DROPPED
        enrollment.setStatus(CourseEnrollment.Status.DROPPED);
        enrollmentRepository.save(enrollment);
    }

    public boolean checkEnrollment(Long courseId, Long studentId) {
        Optional<CourseEnrollment> enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        return enrollment.isPresent() && enrollment.get().getStatus().equals(CourseEnrollment.Status.ACTIVE);
    }

    public EnrollmentDTO getEnrollment(Long courseId, Long studentId) {
        CourseEnrollment enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        return convertToDTO(enrollment);
    }

    private EnrollmentDTO convertToDTO(CourseEnrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setCourseId(enrollment.getCourse().getId());
        dto.setCourseCode(enrollment.getCourse().getCode());
        dto.setCourseName(enrollment.getCourse().getName());
        dto.setStudentId(enrollment.getStudent().getId());
        dto.setStudentFirstName(enrollment.getStudent().getFirstName());
        dto.setStudentLastName(enrollment.getStudent().getLastName());
        dto.setStudentEmail(enrollment.getStudent().getEmail());
        dto.setEnrollmentDate(enrollment.getEnrollmentDate());
        dto.setStatus(enrollment.getStatus().name());
        dto.setCreatedAt(enrollment.getCreatedAt());
        dto.setUpdatedAt(enrollment.getUpdatedAt());
        return dto;
    }
}

