package com.lms.repository;

import com.lms.entity.CourseGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseGradeRepository extends JpaRepository<CourseGrade, Long> {
    Optional<CourseGrade> findByCourseIdAndStudentId(Long courseId, Long studentId);
    List<CourseGrade> findByCourseId(Long courseId);
    List<CourseGrade> findByStudentId(Long studentId);
}

