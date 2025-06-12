package com.vocabularyapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSetupScript implements CommandLineRunner {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Database Setup Script ===");
        
        try {
            // Test database connection
            String result = jdbcTemplate.queryForObject("SELECT 'Database connection successful!' as message", String.class);
            System.out.println("✅ " + result);
            
            // Check if tables exist (Flyway should have created them)
            String[] tables = {"users", "hsk_vocabulary", "quiz_attempts", "quiz_results", "user_progress", "learning_sessions"};
            
            for (String table : tables) {
                try {
                    jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
                    System.out.println("✅ Table '" + table + "' exists and is accessible");
                } catch (Exception e) {
                    System.out.println("❌ Table '" + table + "' not found or not accessible: " + e.getMessage());
                }
            }
            
            // Check Flyway migration status
            try {
                jdbcTemplate.queryForObject("SELECT COUNT(*) FROM flyway_schema_history", Integer.class);
                System.out.println("✅ Flyway migrations have been applied");
            } catch (Exception e) {
                System.out.println("⚠️  Flyway schema history not found - migrations may not have run yet");
            }
            
            System.out.println("=== Database Setup Complete ===");
            
        } catch (Exception e) {
            System.err.println("❌ Database connection failed: " + e.getMessage());
            System.err.println("Please ensure MySQL is running and the database 'vocabulary_app' exists");
        }
    }
}
