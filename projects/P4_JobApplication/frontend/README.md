# Job Application Management System - Frontend

This is the frontend application for the Job Application Management System built with React.js.

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout/      # Layout components
│   ├── config/          # Configuration files
│   │   ├── api.js       # API client configuration
│   │   └── config.js    # App configuration
│   ├── context/         # React Context providers
│   │   └── AuthContext.js
│   ├── routes/          # Routing configuration
│   │   └── AppRouter.js
│   ├── styles/          # Global styles
│   │   └── global.css
│   ├── utils/           # Utility functions
│   │   ├── helpers.js
│   │   └── storage.js
│   ├── App.js           # Main App component
│   └── index.js         # Entry point
├── package.json         # Dependencies
└── README.md           # This file
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

### 3. Start Development Server
```bash
npm start
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Dependencies

### Core Dependencies
- **React** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Query** - Data fetching and caching

### Development Dependencies
- **React Scripts** - Build tools
- **Testing Library** - Testing utilities

## Features Implemented

- ✅ React project structure with Create React App
- ✅ Basic routing setup with React Router
- ✅ API client configuration with Axios
- ✅ Authentication context setup
- ✅ Utility functions and helpers
- ✅ Local storage management
- ✅ Basic layout components
- ✅ Global CSS styling
- ✅ Environment configuration

## API Integration

The frontend is configured to connect to the backend API at `http://localhost:5000/api` by default.

## Next Steps

- [ ] Implement authentication forms
- [ ] Create job listing components
- [ ] Build user dashboard
- [ ] Add application management
- [ ] Implement admin panel
- [ ] Add responsive design
- [ ] Create loading states and error handling