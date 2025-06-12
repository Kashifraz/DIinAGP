package com.socialapp.service;

import com.socialapp.dto.SearchResponse;
import com.socialapp.model.Profile;
import com.socialapp.model.User;
import com.socialapp.repository.ProfileRepository;
import com.socialapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SearchService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Search users by query string (searches both name and email)
     * 
     * @param query Search query string
     * @param excludeUserId User ID to exclude from results (current user)
     * @param page Page number (0-indexed)
     * @param size Page size
     * @return Page of search results
     */
    public Page<SearchResponse> searchUsers(String query, Long excludeUserId, int page, int size) {
        // Validate and sanitize query
        if (query == null || query.trim().isEmpty()) {
            throw new RuntimeException("Search query cannot be empty");
        }

        // Sanitize query - remove leading/trailing whitespace
        String sanitizedQuery = query.trim();

        // Limit page size
        int pageSize = Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, pageSize);

        // Perform search (searches both name and email)
        Page<User> users = userRepository.searchByNameOrEmail(sanitizedQuery, excludeUserId, pageable);

        // Convert to SearchResponse DTOs
        return users.map(this::mapToSearchResponse);
    }

    /**
     * Map User entity to SearchResponse DTO
     */
    private SearchResponse mapToSearchResponse(User user) {
        SearchResponse response = new SearchResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setProfileId(null);
        response.setProfilePhotoUrl(null);

        // Get profile photo if profile exists
        profileRepository.findByUser(user).ifPresent(profile -> {
            response.setProfileId(profile.getId());
            response.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        });

        return response;
    }
}

