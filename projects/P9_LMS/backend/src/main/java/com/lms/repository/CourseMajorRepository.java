package com.lms.repository;

import com.lms.entity.CourseMajor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseMajorRepository extends JpaRepository<CourseMajor, Long> {
    Optional<CourseMajor> findByName(String name);
    boolean existsByName(String name);
    List<CourseMajor> findByStatus(CourseMajor.Status status);
    List<CourseMajor> findByCoordinatorId(Long coordinatorId);
    long countByStatus(CourseMajor.Status status);
}

