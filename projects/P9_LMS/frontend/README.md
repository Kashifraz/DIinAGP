# LMS Frontend

Learning Management System Frontend built with Vue.js 3.

## Prerequisites

- Node.js 18+ and npm

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

3. **Build for Production:**
   ```bash
   npm run build
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   └── layout/      # Layout components (Header, Footer)
│   ├── views/           # Page components
│   ├── stores/          # Pinia stores (state management)
│   ├── services/        # API services
│   ├── router/          # Vue Router configuration
│   ├── App.vue          # Root component
│   └── main.js          # Application entry point
├── index.html
├── vite.config.js
└── package.json
```

## Features

- Vue 3 with Composition API
- Vue Router for navigation
- Pinia for state management
- Axios for HTTP requests
- JWT token authentication
- Route guards for protected routes
- Responsive design

## API Integration

The frontend is configured to proxy API requests to `http://localhost:8080/api` during development.

Make sure the backend server is running on port 8080.

