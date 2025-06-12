package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScanQRCodeRequest {
    @NotBlank(message = "QR code is required")
    private String qrCode;
}

