package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String bio;
    private String profilePhotoUrl;
    private String occupation;
    private String relationshipStatus;
    private String hobbies;
    private String createdAt;
    private String updatedAt;
}

