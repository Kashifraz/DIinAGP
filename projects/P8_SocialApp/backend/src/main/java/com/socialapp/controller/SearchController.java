package com.socialapp.controller;

import com.socialapp.dto.ApiResponse;
import com.socialapp.dto.SearchResponse;
import com.socialapp.model.User;
import com.socialapp.repository.UserRepository;
import com.socialapp.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /**
     * Search users by name or email
     * GET /api/users/search?query={query}&page={page}&size={size}
     * 
     * @param query Search query string (required)
     * @param page Page number (default: 0)
     * @param size Page size (default: 20, max: 100)
     * @return Paginated search results
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<SearchResponse>>> searchUsers(
            @RequestParam("query") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            // Get current user ID to exclude from results
            Long currentUserId = getCurrentUserId();

            // Perform search
            Page<SearchResponse> results = searchService.searchUsers(query, currentUserId, page, size);

            return ResponseEntity.ok(
                ApiResponse.success("Search completed successfully", results)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An error occurred during search"));
        }
    }
}

