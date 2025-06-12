package com.lms.repository;

import com.lms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    boolean existsByCode(String code);
    List<Course> findByMajorId(Long majorId);
    List<Course> findByProfessorId(Long professorId);
    List<Course> findByStatus(Course.Status status);
    List<Course> findByMajorIdAndStatus(Long majorId, Course.Status status);
    long countByStatus(Course.Status status);
    long countByProfessorIdIsNull();
}

