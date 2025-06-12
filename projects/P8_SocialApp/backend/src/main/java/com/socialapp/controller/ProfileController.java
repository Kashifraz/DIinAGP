package com.socialapp.controller;

import com.socialapp.dto.ApiResponse;
import com.socialapp.dto.ProfileResponse;
import com.socialapp.dto.UpdateProfileRequest;
import com.socialapp.model.User;
import com.socialapp.repository.UserRepository;
import com.socialapp.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getCurrentUserProfile() {
        try {
            Long userId = getCurrentUserId();
            ProfileResponse profile = profileService.getProfileByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{userId:\\d+}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getUserProfileById(@PathVariable Long userId) {
        try {
            ProfileResponse profile = profileService.getProfileByUserId(userId);
            return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", profile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateCurrentUserProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            Long userId = getCurrentUserId();
            ProfileResponse updatedProfile = profileService.updateProfile(userId, request);
            return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedProfile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/me/profile-photo")
    public ResponseEntity<ApiResponse<ProfileResponse>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file) {
        try {
            Long userId = getCurrentUserId();
            ProfileResponse updatedProfile = profileService.uploadProfilePhoto(userId, file);
            return ResponseEntity.ok(ApiResponse.success("Profile photo uploaded successfully", updatedProfile));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}

