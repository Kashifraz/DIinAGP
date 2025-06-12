# Blog Platform Backend API

Backend API server for the blog platform built with Node.js, Express, and MongoDB.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Adjust other settings as needed

4. Make sure MongoDB is running on your system or use a cloud MongoDB instance.

5. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Test Endpoints
- `GET /api/test` - Test API endpoint
- `GET /api/test/db` - Test database connection

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection configuration
├── middleware/
│   └── errorHandler.js   # Error handling middleware
├── routes/
│   └── test.js           # Test routes
├── utils/
│   └── apiResponse.js    # API response utilities
├── server.js             # Main server file
├── package.json
└── .env                  # Environment variables (not in git)
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration time
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated for multiple origins, e.g., `http://localhost:3000,http://localhost:3001`). Defaults to `http://localhost:3000,http://localhost:3001` in development

