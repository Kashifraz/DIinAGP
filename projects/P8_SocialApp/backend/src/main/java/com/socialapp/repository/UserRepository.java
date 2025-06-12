package com.socialapp.repository;

import com.socialapp.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    // Search users by name (case-insensitive, partial match)
    @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) AND u.id != :excludeUserId")
    Page<User> searchByName(@Param("query") String query, @Param("excludeUserId") Long excludeUserId, Pageable pageable);
    
    // Search users by email (case-insensitive, partial match)
    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) AND u.id != :excludeUserId")
    Page<User> searchByEmail(@Param("query") String query, @Param("excludeUserId") Long excludeUserId, Pageable pageable);
    
    // Combined search: name or email (case-insensitive, partial match)
    @Query("SELECT u FROM User u WHERE (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND u.id != :excludeUserId")
    Page<User> searchByNameOrEmail(@Param("query") String query, @Param("excludeUserId") Long excludeUserId, Pageable pageable);
}

