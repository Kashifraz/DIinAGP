package com.socialapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 5000, message = "Comment content cannot exceed 5000 characters")
    private String content;
    
    private Long parentCommentId; // Optional: for replies
}

