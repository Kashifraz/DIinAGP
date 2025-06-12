# Social App Backend

Spring Boot backend application for the Social Networking Application.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Setup Instructions

1. **Install MySQL** and create a database (or let the application create it):
   ```sql
   CREATE DATABASE IF NOT EXISTS socialapp_db;
   ```

2. **Update database credentials** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Build the project**:
   ```bash
   mvn clean install
   ```

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

   Or run the main class: `com.socialapp.SocialAppApplication`

## Test Endpoints

Once the application is running, you can test the setup:

- **Health Check**: `GET http://localhost:8080/api/test/health`
- **Database Check**: `GET http://localhost:8080/api/test/database`

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/socialapp/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── exception/       # Exception handlers
│   │   │   ├── model/           # Entity classes (to be added)
│   │   │   ├── repository/      # Repository interfaces (to be added)
│   │   │   ├── service/         # Service classes (to be added)
│   │   │   └── SocialAppApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
└── pom.xml
```

## Configuration

- **Port**: 8080 (configurable in `application.properties`)
- **Database**: MySQL (connection details in `application.properties`)
- **CORS**: Enabled for all origins (development mode)

## Next Steps

- Feature 2: User Authentication
- Feature 3: User Profile Management
- And more...

