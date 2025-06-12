# Database Migrations

This directory contains Flyway database migration scripts.

## Naming Convention

Migration files must follow this naming pattern:
```
V{version}__{description}.sql
```

- `V` - Prefix indicating versioned migration
- `{version}` - Version number (e.g., 1, 2, 3, or 1.1, 1.2)
- `__` - Two underscores (separator)
- `{description}` - Descriptive name in lowercase with underscores
- `.sql` - File extension

## Examples

- `V1__Create_users_table.sql` - Initial migration for users table
- `V2__Create_course_majors_table.sql` - Migration for course majors
- `V3__Add_phone_number_to_users.sql` - Adding a column to existing table

## Important Notes

1. **Never modify existing migration files** - Flyway tracks checksums and will fail if files are modified
2. **Always increment version numbers** - Use the next sequential number
3. **Use descriptive names** - Make it clear what each migration does
4. **Test locally first** - Always test migrations in development before production

## Migration Execution

Migrations are automatically executed when the Spring Boot application starts. Flyway will:
1. Check the `flyway_schema_history` table
2. Identify pending migrations
3. Execute them in version order
4. Record the results in the history table

