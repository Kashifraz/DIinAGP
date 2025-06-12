package com.socialapp.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendFriendRequestRequest {
    @NotNull(message = "Receiver ID is required")
    private Long receiverId;
}

