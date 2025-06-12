package com.ecommerce.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    public void sendVerificationEmail(String to, String verificationToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Email Verification - E-Commerce Platform");
        message.setText("Please click the following link to verify your email address:\n\n" +
                "http://localhost:3000/verify-email?token=" + verificationToken + "\n\n" +
                "If you didn't create an account, please ignore this email.");
        
        mailSender.send(message);
    }
    
    public void sendPasswordResetEmail(String to, String resetToken) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset - E-Commerce Platform");
        message.setText("Please click the following link to reset your password:\n\n" +
                "http://localhost:3000/reset-password?token=" + resetToken + "\n\n" +
                "If you didn't request a password reset, please ignore this email.");
        
        mailSender.send(message);
    }
}
