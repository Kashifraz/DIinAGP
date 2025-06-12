# POS System - Frontend

Vue.js 3 frontend application for the Point of Sale system.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Axios** - HTTP client

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

### 4. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── assets/          # Static assets (CSS, images)
│   ├── components/      # Vue components
│   │   ├── common/      # Reusable components (Loading, Error)
│   │   └── layout/      # Layout components (Header, Sidebar)
│   ├── layouts/         # Layout views
│   ├── router/          # Vue Router configuration
│   ├── services/        # API services
│   ├── stores/          # Pinia stores
│   ├── types/           # TypeScript type definitions
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.ts          # Application entry point
├── .env.development     # Development environment variables
├── .env.production      # Production environment variables
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL

## Features Implemented

- ✅ Vue.js 3 + TypeScript setup
- ✅ Vue Router with route guards
- ✅ Pinia state management
- ✅ Axios with interceptors
- ✅ API service layer
- ✅ Authentication service
- ✅ Base layout components (Header, Sidebar)
- ✅ Loading and error handling components
- ✅ Global styles and theme
- ✅ Environment configuration

## Next Steps

See `tasklist.md` for the complete development roadmap.

