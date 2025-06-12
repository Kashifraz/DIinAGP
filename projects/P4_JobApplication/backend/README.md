# Job Application Management System - Backend

This is the backend API for the Job Application Management System built with Node.js, Express.js, and MongoDB.

## Project Structure

```
backend/
├── config/           # Configuration files
│   ├── config.js     # Main configuration
│   └── database.js   # Database connection
├── middleware/       # Custom middleware
│   ├── errorHandler.js
│   ├── logger.js
│   └── validation.js
├── models/          # MongoDB models
│   ├── User.js
│   └── Category.js
├── routes/          # API routes (to be added)
├── controllers/     # Route controllers (to be added)
├── seeders/         # Database seeders
│   └── seedCategories.js
├── scripts/         # Utility scripts
│   └── seed.js
├── logs/            # Log files (auto-created)
├── uploads/          # File uploads (auto-created)
├── server.js         # Main server file
├── package.json      # Dependencies
└── README.md         # This file
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `env.example` to `.env` and update the values:
```bash
cp env.example .env
```

### 3. Database Setup
Make sure MongoDB is running on your system, then:
```bash
# Seed initial data
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /` - API information
- `GET /health` - Health check

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/job-application-system |
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| JWT_SECRET | JWT secret key | your-super-secret-jwt-key-here |
| JWT_EXPIRE | JWT expiration time | 24h |

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests

## Features Implemented

- ✅ Basic Express.js server setup
- ✅ MongoDB connection with Mongoose
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Error handling middleware
- ✅ Logging system
- ✅ Input validation with Joi
- ✅ User model with role-based schema
- ✅ Category model for job categories
- ✅ Database seeding for initial categories
- ✅ Environment configuration

## Next Steps

- [ ] Implement authentication routes
- [ ] Add job posting models and routes
- [ ] Create application management system
- [ ] Add file upload functionality
- [ ] Implement email notification system
