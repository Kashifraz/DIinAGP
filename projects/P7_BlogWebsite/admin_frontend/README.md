# Blog Platform - Admin Dashboard

React SPA admin dashboard for the blog platform, built with Vite, React, and Tailwind CSS.

## Features

- ⚡️ Fast development with Vite
- ⚛️ React 18 with modern hooks
- 🎨 Tailwind CSS for styling
- 🛣️ React Router for navigation
- 🔌 Axios for API communication
- 📦 ES6 modules

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update the `.env` file with your API configuration:
   - `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:5000/api)

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3001`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
admin_frontend/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.jsx   # Main layout component
│   ├── pages/          # Page components
│   │   └── TestPage.jsx # Test page
│   ├── utils/          # Utility functions
│   │   └── apiClient.js # API client configuration
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles with Tailwind
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── package.json        # Dependencies
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Development

The development server runs on port 3001 by default and includes:
- Hot Module Replacement (HMR)
- API proxy to backend (configured in vite.config.js)
- Source maps for debugging

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

