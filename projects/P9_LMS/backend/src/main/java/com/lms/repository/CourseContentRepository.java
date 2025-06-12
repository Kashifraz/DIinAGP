package com.lms.repository;

import com.lms.entity.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseContentRepository extends JpaRepository<CourseContent, Long> {
    
    List<CourseContent> findByModuleIdOrderByDisplayOrderAsc(Long moduleId);
    
    List<CourseContent> findByCourseIdOrderByDisplayOrderAsc(Long courseId);
    
    List<CourseContent> findByModuleId(Long moduleId);
    
    List<CourseContent> findByCourseId(Long courseId);
}

