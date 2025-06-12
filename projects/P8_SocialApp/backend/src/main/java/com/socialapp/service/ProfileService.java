package com.socialapp.service;

import com.socialapp.dto.ProfileResponse;
import com.socialapp.dto.UpdateProfileRequest;
import com.socialapp.model.Profile;
import com.socialapp.model.User;
import com.socialapp.repository.ProfileRepository;
import com.socialapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Transactional
public class ProfileService {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/profiles/";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    public ProfileResponse getProfileByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // If profile doesn't exist, create it for existing user
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return createProfileForUser(user);
                });
        
        return mapToResponse(profile);
    }

    public ProfileResponse getProfileByUser(User user) {
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    // If profile doesn't exist, create it
                    return createProfileForUser(user);
                });
        
        return mapToResponse(profile);
    }

    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        // Update bio if provided
        if (request.getBio() != null) {
            profile.setBio(request.getBio().trim().isEmpty() ? null : request.getBio().trim());
        }

        // Update full name if provided
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
            userRepository.save(user);
        }

        // Update occupation if provided
        if (request.getOccupation() != null) {
            profile.setOccupation(request.getOccupation().trim().isEmpty() ? null : request.getOccupation().trim());
        }

        // Update relationship status if provided
        if (request.getRelationshipStatus() != null && !request.getRelationshipStatus().trim().isEmpty()) {
            try {
                profile.setRelationshipStatus(Profile.RelationshipStatus.valueOf(request.getRelationshipStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid relationship status. Must be SINGLE, IN_RELATIONSHIP, or MARRIED");
            }
        } else if (request.getRelationshipStatus() != null && request.getRelationshipStatus().trim().isEmpty()) {
            profile.setRelationshipStatus(null);
        }

        // Update hobbies if provided
        if (request.getHobbies() != null) {
            profile.setHobbies(request.getHobbies().trim().isEmpty() ? null : request.getHobbies().trim());
        }

        Profile updatedProfile = profileRepository.save(profile);
        return mapToResponse(updatedProfile);
    }

    public ProfileResponse uploadProfilePhoto(Long userId, MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/jpeg") && !contentType.startsWith("image/png"))) {
            throw new RuntimeException("Only JPEG and PNG images are allowed");
        }

        // Validate file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("File size must not exceed 10MB");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Profile profile = profileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Delete old profile photo if exists
            if (profile.getProfilePhotoUrl() != null && !profile.getProfilePhotoUrl().isEmpty()) {
                try {
                    // Extract just the filename (in case old records have full path)
                    String oldFilename = profile.getProfilePhotoUrl();
                    if (oldFilename.contains("/")) {
                        oldFilename = oldFilename.substring(oldFilename.lastIndexOf("/") + 1);
                    }
                    Path oldPhotoPath = uploadPath.resolve(oldFilename);
                    if (Files.exists(oldPhotoPath)) {
                        Files.delete(oldPhotoPath);
                    }
                } catch (Exception e) {
                    // Log error but continue with new upload
                    System.err.println("Error deleting old profile photo: " + e.getMessage());
                }
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update profile with new photo URL - store only filename, not full path
            profile.setProfilePhotoUrl(filename);
            Profile updatedProfile = profileRepository.save(profile);

            return mapToResponse(updatedProfile);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload profile photo: " + e.getMessage());
        }
    }

    public Profile createProfileForUser(User user) {
        // Check if profile already exists
        if (profileRepository.existsByUserId(user.getId())) {
            // Return existing profile instead of throwing error
            return profileRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Unexpected error: Profile exists but not found"));
        }

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setBio(null);
        profile.setProfilePhotoUrl(null);

        return profileRepository.save(profile);
    }

    private ProfileResponse mapToResponse(Profile profile) {
        ProfileResponse response = new ProfileResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUser().getId());
        response.setEmail(profile.getUser().getEmail());
        response.setFullName(profile.getUser().getFullName());
        response.setBio(profile.getBio());
        response.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        response.setOccupation(profile.getOccupation());
        response.setRelationshipStatus(profile.getRelationshipStatus() != null ? profile.getRelationshipStatus().name() : null);
        response.setHobbies(profile.getHobbies());
        response.setCreatedAt(profile.getCreatedAt() != null ? profile.getCreatedAt().format(DATE_FORMATTER) : null);
        response.setUpdatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().format(DATE_FORMATTER) : null);
        return response;
    }
}

