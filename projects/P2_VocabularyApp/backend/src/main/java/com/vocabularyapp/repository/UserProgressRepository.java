package com.vocabularyapp.repository;

import com.vocabularyapp.entity.User;
import com.vocabularyapp.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    
    List<UserProgress> findByUserOrderByHskLevel(User user);
    
    Optional<UserProgress> findByUserAndHskLevel(User user, Integer hskLevel);
    
    List<UserProgress> findByUser(User user);
}
