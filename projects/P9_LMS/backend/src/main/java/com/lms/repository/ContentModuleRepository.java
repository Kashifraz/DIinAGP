package com.lms.repository;

import com.lms.entity.ContentModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentModuleRepository extends JpaRepository<ContentModule, Long> {
    
    List<ContentModule> findByCourseIdOrderByDisplayOrderAsc(Long courseId);
    
    List<ContentModule> findByCourseId(Long courseId);
}

