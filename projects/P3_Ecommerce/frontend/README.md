# E-Commerce Frontend

React TypeScript frontend application for the e-commerce platform.

## Prerequisites

- Node.js 16 or higher
- npm or yarn

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

The application will run on `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API service calls
├── hooks/         # Custom React hooks
├── context/       # React context providers
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── assets/        # Static assets
```

## Features

- **Home Page**: Welcome page with backend health check
- **Login Page**: User authentication form
- **Register Page**: User registration form
- **Admin Page**: Admin dashboard placeholder
- **Navigation**: Responsive navigation bar
- **API Integration**: Axios-based API client

## API Configuration

The frontend is configured to communicate with the backend at:
- Base URL: `http://localhost:8080/api`
- Health Check: `GET /public/health`

## Technologies Used

- React 19.1.1
- TypeScript 4.9.5
- React Router DOM 7.8.2
- Axios 1.11.0
- Tailwind CSS 4.1.12

## Development

The application uses:
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **TypeScript** for type safety

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App
