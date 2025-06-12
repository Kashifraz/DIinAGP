package com.socialapp.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    
    private String fullName;
    
    @Size(max = 200, message = "Occupation must not exceed 200 characters")
    private String occupation;
    
    private String relationshipStatus; // SINGLE, IN_RELATIONSHIP, MARRIED
    
    @Size(max = 1000, message = "Hobbies must not exceed 1000 characters")
    private String hobbies;
}

