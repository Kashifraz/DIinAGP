package com.socialapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddReactionRequest {
    @NotBlank(message = "Reaction type cannot be empty")
    @Pattern(regexp = "HEART|THUMBS_UP|LAUGH|SAD|ANGRY|THUMBS_DOWN", 
             message = "Reaction type must be one of: HEART, THUMBS_UP, LAUGH, SAD, ANGRY, THUMBS_DOWN")
    private String reactionType;
}

