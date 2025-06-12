# Environment Variables Setup

## Development Environment

Create a `.env.development` file in the frontend root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Production Environment

Create a `.env.production` file in the frontend root directory:

```env
VITE_API_BASE_URL=/api
```

## Notes

- Environment variables must be prefixed with `VITE_` to be accessible in the frontend
- The development server runs on port 3000 by default
- The API proxy is configured in `vite.config.ts` to forward `/api` requests to the backend

