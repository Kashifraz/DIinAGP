# POS System - Backend API

Backend API built with CodeIgniter 4 for the Point of Sale system.

## Setup Instructions

### 1. Install Dependencies

```bash
composer install
```

### 2. Configure Environment

1. Copy the `env` file to `.env`:
   ```bash
   cp env .env
   ```

2. Update database settings in `.env` file (see `DATABASE_SETUP.md` for details)

3. Set environment:
   ```env
   CI_ENVIRONMENT = development
   ```

### 3. Create Database

Create a MySQL database named `pos_system` (or update the name in `.env`):

```sql
CREATE DATABASE pos_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Development Server

```bash
php spark serve
```

The server will start at `http://localhost:8080`

### 5. Test API Endpoints

#### Test API Status
```
GET http://localhost:8080/api/test
```

#### Test Database Connection
```
GET http://localhost:8080/api/test/database
```

## Project Structure

```
backend/
├── app/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── BaseApiController.php    # Base API controller
│   │       └── TestController.php      # Test endpoints
│   ├── Filters/
│   │   └── CorsFilter.php              # CORS filter
│   ├── Helpers/
│   │   └── ApiResponse.php             # API response helper
│   └── Config/
│       ├── Autoload.php                 # Helper autoloading
│       ├── Filters.php                 # Filter configuration
│       └── Routes.php                  # API routes
├── public/                             # Web root
└── .env                                # Environment configuration
```

## API Response Format

All API responses follow a standard format:

```json
{
    "success": true,
    "message": "Operation successful",
    "data": {},
    "timestamp": "2024-01-01 12:00:00"
}
```

## Features Implemented

- ✅ CodeIgniter 4 setup
- ✅ Database configuration
- ✅ API response helper/formatter
- ✅ CORS filter
- ✅ Base API controller
- ✅ Test API endpoints

## Next Steps

See `tasklist.md` for the complete development roadmap.
