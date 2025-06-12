package com.socialapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddCommentReactionRequest {
    @NotBlank(message = "Reaction type cannot be empty")
    @Pattern(regexp = "LIKE|DISLIKE", 
             message = "Reaction type must be either LIKE or DISLIKE")
    private String reactionType;
}

