# LMS Backend

Learning Management System Backend built with Spring Boot.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Setup Instructions

1. **Create MySQL Database:**
   ```sql
   CREATE DATABASE lms_db;
   ```

2. **Update Database Configuration:**
   Edit `src/main/resources/application.properties` and update:
   - `spring.datasource.username` - Your MySQL username
   - `spring.datasource.password` - Your MySQL password

3. **Update JWT Secret:**
   Edit `src/main/resources/application.properties` and change:
   - `jwt.secret` - Use a strong secret key (minimum 256 bits)

4. **Build and Run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   Or run the main class `LmsApplication` from your IDE.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token

## Default Port

The application runs on port `8080` with context path `/api`.

## Database Migrations

The application uses **Flyway** for database version control and migrations.

### Migration Files Location
- Migration files are located in: `src/main/resources/db/migration/`
- Naming convention: `V{version}__{description}.sql`
  - Example: `V1__Create_users_table.sql`

### How Migrations Work
1. **Automatic Execution**: Flyway automatically runs migrations on application startup
2. **Version Control**: Each migration is versioned and tracked in the `flyway_schema_history` table
3. **Idempotent**: Migrations are only executed once - Flyway tracks which migrations have been applied
4. **Validation**: Flyway validates migration checksums to ensure they haven't been modified

### Creating New Migrations
1. Create a new SQL file in `src/main/resources/db/migration/`
2. Follow the naming convention: `V{next_version}__{description}.sql`
3. Example: `V2__Create_course_majors_table.sql`
4. On next application startup, Flyway will automatically detect and execute the new migration

### Migration Best Practices
- **Never modify existing migration files** - Flyway tracks checksums
- **Always create new migration files** for schema changes
- **Use descriptive names** that explain what the migration does
- **Test migrations** in development before deploying to production
- **Backup database** before running migrations in production

### Manual Migration (Optional)
If you need to run migrations manually:
```bash
mvn flyway:migrate
```

### Checking Migration Status
Flyway creates a `flyway_schema_history` table in your database that tracks:
- Migration version
- Description
- Type (SQL, JAVA, etc.)
- Checksum
- Execution timestamp
- Success/failure status

