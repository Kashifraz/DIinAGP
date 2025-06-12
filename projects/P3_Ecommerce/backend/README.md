# E-Commerce Backend

Spring Boot backend application for the e-commerce platform.

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

## Setup Instructions

### 1. Database Setup
The application uses Flyway for automatic database migrations. Simply start the application and Flyway will create the database schema automatically.

**Prerequisites:**
- MySQL 8.0 or higher
- Create an empty database named `ecommerce_db`

```sql
CREATE DATABASE ecommerce_db;
```

### 2. Configuration
Update `src/main/resources/application.properties` with your database credentials:
- `spring.datasource.username`
- `spring.datasource.password`
- `jwt.secret` (generate a secure secret key)
- Email configuration (if using Gmail, use App Password)
- Stripe API keys

### 3. Build and Run
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

### 4. Test the Application
Once running, test the health endpoint:
```
GET http://localhost:8080/api/public/health
```

## Project Structure

```
src/main/java/com/ecommerce/
├── config/          # Configuration classes
├── controller/      # REST API controllers
├── model/          # Entity classes
├── repository/     # Data access layer
├── service/        # Business logic
├── security/       # JWT and security
├── dto/            # Data transfer objects
├── exception/      # Custom exceptions
└── util/           # Utility classes
```

## API Endpoints

- `GET /api/public/health` - Health check endpoint

## Dependencies

- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- MySQL Connector
- JWT
- Stripe Java SDK
- Spring Mail

## Development

The application runs on port 8080 with context path `/api`.
