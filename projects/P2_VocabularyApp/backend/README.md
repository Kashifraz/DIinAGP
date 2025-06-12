# Vocabulary App Backend

## Prerequisites

Before running the backend, ensure you have the following installed:

1. **Java 17** or higher
2. **Maven 3.6+**
3. **MySQL 8.0+** running on your system

## Database Setup

1. **Start MySQL service**
2. **Create database** (if not exists):
   ```sql
   CREATE DATABASE vocabulary_app;
   ```
3. **Update database credentials** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

## Running the Application

### Option 1: Using Maven
```bash
cd backend
mvn spring-boot:run
```

### Option 2: Using IDE
Run the `VocabularyAppApplication.java` main class

## Testing the Setup

Once the application starts successfully, you can test the database connection:

1. **Health Check**: `GET http://localhost:8080/api/health`
2. **Check Console Output**: Look for database setup messages

## Expected Output

When the application starts successfully, you should see:
- Spring Boot startup logs
- Database connection success message
- Table existence verification
- "Database Setup Complete" message

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify database credentials in `application.properties`
- Check if database `vocabulary_app` exists
- Verify MySQL is accessible on `localhost:3306`

### Port Issues
- Default port is 8080
- Change port in `application.properties` if needed: `server.port=8081`

## Project Structure

```
backend/
├── src/main/java/com/vocabularyapp/
│   ├── VocabularyAppApplication.java          # Main application class
│   ├── entity/                                # JPA entities
│   │   ├── User.java
│   │   ├── HskVocabulary.java
│   │   ├── QuizAttempt.java
│   │   ├── QuizResult.java
│   │   ├── UserProgress.java
│   │   └── LearningSession.java
│   ├── repository/                            # JPA repositories
│   │   ├── UserRepository.java
│   │   ├── HskVocabularyRepository.java
│   │   ├── QuizAttemptRepository.java
│   │   ├── QuizResultRepository.java
│   │   ├── UserProgressRepository.java
│   │   └── LearningSessionRepository.java
│   ├── config/                               # Configuration classes
│   │   ├── DatabaseConfig.java
│   │   └── DatabaseSetupScript.java
│   └── controller/                           # REST controllers
│       └── HealthController.java
├── src/main/resources/
│   └── application.properties                # Application configuration
└── pom.xml                                  # Maven dependencies
```

## Next Steps

After successful setup:
1. Verify all tables are created in MySQL
2. Test the health endpoint
3. Proceed to Feature 2: Data Seeding System
