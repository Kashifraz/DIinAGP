package com.lms.service;

import com.lms.dto.ResultsheetDTO;
import com.lms.entity.*;
import com.lms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ResultsheetService {

    @Autowired
    private GradeRepository gradeRepository;

    @Autowired
    private CourseGradeRepository courseGradeRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private GradeService gradeService;

    /**
     * Generate resultsheet for a specific student in a specific course
     */
    public ResultsheetDTO generateResultsheet(Long courseId, Long studentId) {
        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Get student
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Verify student is enrolled in the course
        Optional<CourseEnrollment> enrollment = enrollmentRepository.findByCourseIdAndStudentId(courseId, studentId);
        if (enrollment.isEmpty() || enrollment.get().getStatus() != CourseEnrollment.Status.ACTIVE) {
            throw new RuntimeException("Student is not enrolled in this course");
        }

        // Get all assessments for the course
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);

        // Get all grades for this student in this course
        List<Grade> grades = gradeRepository.findByCourseIdAndStudentId(courseId, studentId);

        // Build assessment grades list
        List<ResultsheetDTO.AssessmentGradeDTO> assessmentGrades = new ArrayList<>();
        BigDecimal totalWeight = BigDecimal.ZERO;
        int gradedCount = 0;

        for (Assessment assessment : assessments) {
            ResultsheetDTO.AssessmentGradeDTO assessmentGrade = new ResultsheetDTO.AssessmentGradeDTO();
            assessmentGrade.setAssessmentId(assessment.getId());
            assessmentGrade.setAssessmentTitle(assessment.getTitle());
            assessmentGrade.setAssessmentType(assessment.getAssessmentType().name());
            assessmentGrade.setMaximumMarks(assessment.getMaximumMarks());
            assessmentGrade.setWeightPercentage(assessment.getWeightPercentage());
            totalWeight = totalWeight.add(assessment.getWeightPercentage());

            // Find grade for this assessment
            Optional<Grade> grade = grades.stream()
                    .filter(g -> g.getAssessment().getId().equals(assessment.getId()))
                    .findFirst();

            if (grade.isPresent()) {
                Grade g = grade.get();
                assessmentGrade.setMarksObtained(g.getMarksObtained());
                assessmentGrade.setFeedback(g.getFeedback());
                assessmentGrade.setGradedAt(g.getGradedAt());

                // Calculate percentage score
                BigDecimal percentage = g.getMarksObtained()
                        .divide(assessment.getMaximumMarks(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                assessmentGrade.setPercentageScore(percentage);

                // Calculate weighted score
                BigDecimal weight = assessment.getWeightPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                BigDecimal weightedScore = percentage.multiply(weight);
                assessmentGrade.setWeightedScore(weightedScore);

                gradedCount++;
            } else {
                // No grade yet
                assessmentGrade.setMarksObtained(BigDecimal.ZERO);
                assessmentGrade.setPercentageScore(BigDecimal.ZERO);
                assessmentGrade.setWeightedScore(BigDecimal.ZERO);
            }

            assessmentGrades.add(assessmentGrade);
        }

        // Get or calculate course grade
        CourseGrade courseGrade;
        Optional<CourseGrade> existingCourseGrade = courseGradeRepository.findByCourseIdAndStudentId(courseId, studentId);
        
        if (existingCourseGrade.isPresent()) {
            courseGrade = existingCourseGrade.get();
        } else {
            // Calculate course grade if not exists
            if (!grades.isEmpty()) {
                gradeService.calculateCourseGrade(courseId, studentId);
                courseGrade = courseGradeRepository.findByCourseIdAndStudentId(courseId, studentId)
                        .orElseThrow(() -> new RuntimeException("Failed to calculate course grade"));
            } else {
                throw new RuntimeException("No grades found for this course and student");
            }
        }

        // Build resultsheet DTO
        ResultsheetDTO resultsheet = new ResultsheetDTO();
        resultsheet.setStudentId(student.getId());
        resultsheet.setStudentName(student.getFirstName() + " " + student.getLastName());
        resultsheet.setStudentEmail(student.getEmail());
        resultsheet.setCourseId(course.getId());
        resultsheet.setCourseCode(course.getCode());
        resultsheet.setCourseName(course.getName());
        resultsheet.setMajorName(course.getMajor().getName());
        resultsheet.setCreditHours(course.getCreditHours());
        resultsheet.setAssessmentGrades(assessmentGrades);
        resultsheet.setOverallGrade(courseGrade.getOverallGrade());
        resultsheet.setGradeLetter(courseGrade.getGradeLetter());
        resultsheet.setLastCalculatedAt(courseGrade.getLastCalculatedAt());
        resultsheet.setTotalWeight(totalWeight);
        resultsheet.setTotalAssessments(assessments.size());
        resultsheet.setGradedAssessments(gradedCount);

        return resultsheet;
    }

    /**
     * Get resultsheet by course (for a specific student)
     * Alias for generateResultsheet
     */
    public ResultsheetDTO getResultsheetByCourse(Long courseId, Long studentId) {
        return generateResultsheet(courseId, studentId);
    }

    /**
     * Get all resultsheets for a student (across all enrolled courses)
     */
    public List<ResultsheetDTO> getResultsheetsByStudent(Long studentId) {
        // Get all active enrollments for the student
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(studentId, CourseEnrollment.Status.ACTIVE);

        List<ResultsheetDTO> resultsheets = new ArrayList<>();
        for (CourseEnrollment enrollment : enrollments) {
            try {
                ResultsheetDTO resultsheet = generateResultsheet(enrollment.getCourse().getId(), studentId);
                resultsheets.add(resultsheet);
            } catch (Exception e) {
                // Skip courses without grades
                // Log error if needed
            }
        }

        return resultsheets;
    }

    /**
     * Get all resultsheets for a course (all students enrolled in the course)
     */
    public List<ResultsheetDTO> getResultsheetsByCourse(Long courseId, Long professorId) {
        // Verify professor is assigned to this course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (course.getProfessor() == null || !course.getProfessor().getId().equals(professorId)) {
            throw new RuntimeException("You don't have permission to access resultsheets for this course");
        }

        // Get all active enrollments for the course
        List<CourseEnrollment> enrollments = enrollmentRepository.findByCourseIdAndStatus(courseId, CourseEnrollment.Status.ACTIVE);

        List<ResultsheetDTO> resultsheets = new ArrayList<>();
        for (CourseEnrollment enrollment : enrollments) {
            try {
                ResultsheetDTO resultsheet = generateResultsheet(courseId, enrollment.getStudent().getId());
                resultsheets.add(resultsheet);
            } catch (Exception e) {
                // Skip students without grades
                // Log error if needed
            }
        }

        return resultsheets;
    }

    /**
     * Calculate grade breakdown for a course and student
     * Returns detailed breakdown of how the overall grade was calculated
     */
    public ResultsheetDTO calculateGradeBreakdown(Long courseId, Long studentId) {
        return generateResultsheet(courseId, studentId);
    }

    /**
     * Get grade letter based on overall grade percentage
     */
    public CourseGrade.GradeLetter getGradeLetter(BigDecimal overallGrade) {
        if (overallGrade.compareTo(BigDecimal.valueOf(90)) >= 0) {
            return CourseGrade.GradeLetter.A;
        } else if (overallGrade.compareTo(BigDecimal.valueOf(80)) >= 0) {
            return CourseGrade.GradeLetter.B;
        } else if (overallGrade.compareTo(BigDecimal.valueOf(70)) >= 0) {
            return CourseGrade.GradeLetter.C;
        } else if (overallGrade.compareTo(BigDecimal.valueOf(60)) >= 0) {
            return CourseGrade.GradeLetter.D;
        } else {
            return CourseGrade.GradeLetter.F;
        }
    }
}

