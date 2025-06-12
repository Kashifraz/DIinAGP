# CV Builder Frontend

A React TypeScript frontend application for the CV Builder platform built with the MERN stack.

## Features

- Modern React 18 with TypeScript
- Responsive design with Tailwind CSS
- React Router for navigation
- React Query for data fetching
- React Hook Form for form management
- Hot toast notifications
- Lucide React icons
- Custom component library

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **State Management:** React Query
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios

## Project Structure

```
frontend/
├── public/                 # Static files
│   ├── index.html         # Main HTML template
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # Reusable components
│   │   └── Layout/        # Layout components
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   ├── assets/            # Static assets
│   ├── App.tsx            # Main App component
│   ├── index.tsx          # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_ENV=development
   ```

## Running the Application

### Development Mode
```bash
npm start
```

The application will start on `http://localhost:3000` and automatically open in your browser.

### Production Build
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Type Checking
```bash
npm run type-check
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run eject` - Eject from Create React App (not recommended)

## Pages

- **Home** (`/`) - Landing page with features and CTA
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration
- **Dashboard** (`/dashboard`) - User dashboard with CV management
- **Profile** (`/dashboard/profile`) - User profile management
- **404** (`/*`) - Not found page

## Components

### Layout Components
- `Layout` - Main layout wrapper
- `Header` - Navigation header
- `Footer` - Site footer

### UI Components
- Custom button components with variants
- Form input components
- Card components
- Loading and skeleton components

## Styling

The application uses Tailwind CSS with custom configuration:

- **Colors:** Primary, secondary, success, warning, error palettes
- **Typography:** Inter font family
- **Components:** Custom component classes
- **Utilities:** Custom utility functions

## API Integration

- Axios for HTTP requests
- Request/response interceptors
- Automatic token handling
- Error handling and logging
- File upload support

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Use semantic HTML

### Component Structure
- Keep components small and focused
- Use proper prop types
- Implement loading and error states
- Follow accessibility guidelines

### State Management
- Use React Query for server state
- Use local state for UI state
- Implement proper loading states
- Handle errors gracefully

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `REACT_APP_ENV` | Environment mode | `development` |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
