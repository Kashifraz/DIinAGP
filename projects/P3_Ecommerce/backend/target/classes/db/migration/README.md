# Database Migrations with Flyway

This directory contains Flyway database migrations for the E-Commerce application.

## Migration Files

### V1__Create_users_table.sql
- Creates the initial users table with all required fields
- Adds performance indexes
- Inserts a default admin user

## Migration Naming Convention

Flyway migration files follow this naming pattern:
```
V{version}__{description}.sql
```

Examples:
- `V1__Create_users_table.sql`
- `V2__Add_categories_table.sql`
- `V3__Add_products_table.sql`

## How It Works

1. **Automatic Migration**: When the Spring Boot application starts, Flyway automatically runs any pending migrations
2. **Version Control**: Each migration is tracked in the `flyway_schema_history` table
3. **Idempotent**: Migrations are only run once, even if the application restarts
4. **Validation**: Flyway validates that migrations haven't been modified

## Migration Process

1. Create a new SQL file in this directory with the correct naming convention
2. Write your SQL statements (CREATE TABLE, ALTER TABLE, etc.)
3. Start the application - Flyway will automatically run the migration
4. Check the `flyway_schema_history` table to verify the migration was applied

## Manual Migration Commands

If you need to run migrations manually:

```bash
# Check migration status
mvn flyway:info

# Run migrations
mvn flyway:migrate

# Clean database (WARNING: This will delete all data)
mvn flyway:clean

# Validate migrations
mvn flyway:validate
```

## Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Test migrations** on a copy of production data
3. **Use descriptive names** for migration files
4. **Keep migrations small** and focused
5. **Always backup** before running migrations in production

## Current Schema

### Users Table
- `id` - Primary key, auto-increment
- `email` - Unique email address
- `password_hash` - BCrypt hashed password
- `first_name` - User's first name
- `last_name` - User's last name
- `role` - CUSTOMER or ADMIN
- `email_verified` - Email verification status
- `verification_token` - For email verification
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### Indexes
- `idx_email` - Fast email lookups
- `idx_verification_token` - Email verification
- `idx_role` - Role-based queries
- `idx_email_verified` - Filter verified users

## Default Admin User

The initial migration creates a default admin user:
- **Email:** admin@ecommerce.com
- **Password:** admin123
- **Role:** ADMIN
- **Email Verified:** TRUE

**⚠️ Important:** Change the default admin password in production!
