# Blog Platform - Public Blog Website

Next.js SSR public blog website for the blog platform, built with Next.js 14, React, and Tailwind CSS.

## Features

- ⚡️ Next.js 14 with App Router
- ⚛️ React 18 with Server-Side Rendering
- 🎨 Tailwind CSS for styling
- 🔌 Axios for API communication
- 📦 Server-Side Rendering (SSR) for SEO
- 🚀 Optimized performance

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file:
```bash
cp .env.example .env.local
```

3. Update the `.env.local` file with your API configuration:
   - `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL (default: http://localhost:5000/api)

4. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
user_frontend/
├── app/
│   ├── layout.jsx        # Root layout
│   ├── page.jsx         # Home page
│   ├── globals.css      # Global styles
│   └── test/
│       └── page.jsx     # Test page
├── utils/
│   └── apiClient.js     # API client configuration
├── public/              # Static assets
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies
```

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL
- `NODE_ENV` - Environment (development/production)

## Development

The development server runs on port 3000 by default and includes:
- Hot Module Replacement (HMR)
- Fast Refresh
- Server-Side Rendering
- API route rewrites (configured in next.config.js)

## Building for Production

```bash
npm run build
npm start
```

The production build will be optimized and ready for deployment.

## Next.js Features Used

- **App Router**: Modern routing with the `app` directory
- **Server Components**: Default server-side rendering
- **Client Components**: Marked with `'use client'` directive
- **Image Optimization**: Built-in Next.js Image component support
- **API Routes**: Can be added in `app/api` directory

