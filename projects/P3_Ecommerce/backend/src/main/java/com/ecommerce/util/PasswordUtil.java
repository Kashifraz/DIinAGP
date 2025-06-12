package com.ecommerce.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class for password operations
 * This is mainly for development/testing purposes
 */
public class PasswordUtil {
    
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    
    /**
     * Generate BCrypt hash for a given password
     * @param rawPassword the raw password to hash
     * @return the BCrypt hash
     */
    public static String hashPassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }
    
    /**
     * Check if a raw password matches a hash
     * @param rawPassword the raw password
     * @param hash the hash to check against
     * @return true if password matches
     */
    public static boolean matches(String rawPassword, String hash) {
        return encoder.matches(rawPassword, hash);
    }
    
    /**
     * Main method to generate hash for testing
     * Run this to get the hash for 'admin123'
     */
    public static void main(String[] args) {
        String password = "admin123";
        String hash = hashPassword(password);
        System.out.println("Password: " + password);
        System.out.println("Hash: " + hash);
        System.out.println("Matches: " + matches(password, hash));
        
        // Also test with the existing hash
        String existingHash = "$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa";
        System.out.println("Existing hash matches: " + matches(password, existingHash));
    }
}
