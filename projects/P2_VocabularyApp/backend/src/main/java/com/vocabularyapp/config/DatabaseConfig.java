package com.vocabularyapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "com.vocabularyapp.repository")
@EnableTransactionManagement
public class DatabaseConfig {
    // Database configuration is handled by application.properties
    // This class enables JPA repositories and transaction management
}
