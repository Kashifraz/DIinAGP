package com.ecommerce.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Simple utility to generate password hashes
 * Run this main method to get the correct hash for admin123
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        String password = "admin123";
        String hash = encoder.encode(password);
        
        System.out.println("=== Password Hash Generator ===");
        System.out.println("Password: " + password);
        System.out.println("Generated Hash: " + hash);
        System.out.println("Verification: " + encoder.matches(password, hash));
        
        // Test with existing hash
        String existingHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa";
        System.out.println("\n=== Testing Existing Hash ===");
        System.out.println("Existing Hash: " + existingHash);
        System.out.println("Matches admin123: " + encoder.matches(password, existingHash));
        
        // Generate a new hash for admin123
        String newHash = encoder.encode(password);
        System.out.println("\n=== New Hash for admin123 ===");
        System.out.println("New Hash: " + newHash);
        System.out.println("Verification: " + encoder.matches(password, newHash));
        
        System.out.println("\n=== SQL Update Statement ===");
        System.out.println("UPDATE users SET password_hash = '" + newHash + "' WHERE email = 'admin@ecommerce.com';");
    }
}
