package com.lms.service;

import com.lms.dto.CreateTimetableRequest;
import com.lms.dto.TimetableEntryDTO;
import com.lms.dto.UpdateTimetableRequest;
import com.lms.entity.Course;
import com.lms.entity.CourseEnrollment;
import com.lms.entity.TimetableEntry;
import com.lms.entity.User;
import com.lms.repository.CourseEnrollmentRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.TimetableEntryRepository;
import com.lms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TimetableService {

    @Autowired
    private TimetableEntryRepository timetableRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Transactional
    public TimetableEntryDTO createTimetableEntry(Long courseId, Long professorId, CreateTimetableRequest request) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Validate professor is assigned to this course
        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to create timetable entries for this course");
        }

        // Validate professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + professorId));

        if (professor.getRole() != User.Role.PROFESSOR) {
            throw new RuntimeException("User is not a professor");
        }

        // Validate times
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Calculate duration
        Duration duration = Duration.between(request.getStartTime(), request.getEndTime());
        int durationMinutes = (int) duration.toMinutes();

        // Create timetable entry
        TimetableEntry entry = new TimetableEntry();
        entry.setCourse(course);
        entry.setDayOfWeek(request.getDayOfWeek());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setDurationMinutes(durationMinutes);
        entry.setLocation(request.getLocation());

        entry = timetableRepository.save(entry);
        return convertToDTO(entry);
    }

    public List<TimetableEntryDTO> getTimetableByCourse(Long courseId) {
        List<TimetableEntry> entries = timetableRepository.findByCourseIdOrderByDayOfWeekAscStartTimeAsc(courseId);
        return entries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TimetableEntryDTO> getTimetableByStudent(Long studentId) {
        // Get all active enrollments for the student
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(studentId, CourseEnrollment.Status.ACTIVE);
        
        // Get all course IDs
        List<Long> courseIds = enrollments.stream()
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toList());

        // Get all timetable entries for these courses
        List<TimetableEntry> allEntries = timetableRepository.findAll().stream()
                .filter(entry -> courseIds.contains(entry.getCourse().getId()))
                .sorted((e1, e2) -> {
                    int dayCompare = e1.getDayOfWeek().compareTo(e2.getDayOfWeek());
                    if (dayCompare != 0) return dayCompare;
                    return e1.getStartTime().compareTo(e2.getStartTime());
                })
                .collect(Collectors.toList());

        return allEntries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TimetableEntryDTO> getTimetableByProfessor(Long professorId) {
        // Get all courses assigned to the professor
        List<Course> courses = courseRepository.findByProfessorId(professorId);
        
        // Get all course IDs
        List<Long> courseIds = courses.stream()
                .map(Course::getId)
                .collect(Collectors.toList());

        // Get all timetable entries for these courses
        List<TimetableEntry> allEntries = timetableRepository.findAll().stream()
                .filter(entry -> courseIds.contains(entry.getCourse().getId()))
                .sorted((e1, e2) -> {
                    int dayCompare = e1.getDayOfWeek().compareTo(e2.getDayOfWeek());
                    if (dayCompare != 0) return dayCompare;
                    return e1.getStartTime().compareTo(e2.getStartTime());
                })
                .collect(Collectors.toList());

        return allEntries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TimetableEntryDTO updateTimetableEntry(Long entryId, Long professorId, UpdateTimetableRequest request) {
        // Get timetable entry
        TimetableEntry entry = timetableRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Timetable entry not found with id: " + entryId));

        // Validate professor is assigned to this course
        if (entry.getCourse().getProfessor() == null || !entry.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to update this timetable entry");
        }

        // Validate professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + professorId));

        if (professor.getRole() != User.Role.PROFESSOR) {
            throw new RuntimeException("User is not a professor");
        }

        // Validate times
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
        }

        // Calculate duration
        Duration duration = Duration.between(request.getStartTime(), request.getEndTime());
        int durationMinutes = (int) duration.toMinutes();

        // Update timetable entry
        entry.setDayOfWeek(request.getDayOfWeek());
        entry.setStartTime(request.getStartTime());
        entry.setEndTime(request.getEndTime());
        entry.setDurationMinutes(durationMinutes);
        entry.setLocation(request.getLocation());

        entry = timetableRepository.save(entry);
        return convertToDTO(entry);
    }

    @Transactional
    public void deleteTimetableEntry(Long entryId, Long professorId) {
        // Get timetable entry
        TimetableEntry entry = timetableRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Timetable entry not found with id: " + entryId));

        // Validate professor is assigned to this course
        if (entry.getCourse().getProfessor() == null || !entry.getCourse().getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to delete this timetable entry");
        }

        // Validate professor
        User professor = userRepository.findById(professorId)
                .orElseThrow(() -> new RuntimeException("Professor not found with id: " + professorId));

        if (professor.getRole() != User.Role.PROFESSOR) {
            throw new RuntimeException("User is not a professor");
        }

        timetableRepository.delete(entry);
    }

    private TimetableEntryDTO convertToDTO(TimetableEntry entry) {
        TimetableEntryDTO dto = new TimetableEntryDTO();
        dto.setId(entry.getId());
        dto.setCourseId(entry.getCourse().getId());
        dto.setCourseName(entry.getCourse().getName());
        dto.setCourseCode(entry.getCourse().getCode());
        dto.setDayOfWeek(entry.getDayOfWeek());
        dto.setStartTime(entry.getStartTime());
        dto.setEndTime(entry.getEndTime());
        dto.setDurationMinutes(entry.getDurationMinutes());
        dto.setLocation(entry.getLocation());
        dto.setCourseStartDate(entry.getCourse().getStartDate());
        dto.setCourseEndDate(entry.getCourse().getEndDate());
        dto.setCreatedAt(entry.getCreatedAt());
        dto.setUpdatedAt(entry.getUpdatedAt());
        return dto;
    }
}

