# Task Management System Deployment Script
# This script automates the setup and deployment process

param(
    [string]$Environment = "development",
    [string]$DatabaseUrl = "",
    [string]$JwtSecret = "",
    [switch]$SkipDatabase = $false,
    [switch]$Production = $false
)

Write-Host "🚀 Task Management System Deployment Script" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-Command "node")) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow

# Root dependencies
if (Test-Path "package.json") {
    Write-Host "Installing root dependencies..." -ForegroundColor Cyan
    npm install
}

# Server dependencies
if (Test-Path "server/package.json") {
    Write-Host "Installing server dependencies..." -ForegroundColor Cyan
    Set-Location server
    npm install
    Set-Location ..
}

# Client dependencies
if (Test-Path "client/package.json") {
    Write-Host "Installing client dependencies..." -ForegroundColor Cyan
    Set-Location client
    npm install
    Set-Location ..
}

# Database setup
if (-not $SkipDatabase) {
    Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
    
    if (Test-Path "server/env.example") {
        if (-not (Test-Path "server/.env")) {
            Write-Host "Creating .env file..." -ForegroundColor Cyan
            Copy-Item "server/env.example" "server/.env"
            
            # Update environment variables if provided
            if ($DatabaseUrl) {
                (Get-Content "server/.env") -replace "DATABASE_URL=.*", "DATABASE_URL=$DatabaseUrl" | Set-Content "server/.env"
            }
            
            if ($JwtSecret) {
                (Get-Content "server/.env") -replace "JWT_SECRET=.*", "JWT_SECRET=$JwtSecret" | Set-Content "server/.env"
            }
        }
        
        # Run database migrations
        Write-Host "Running database migrations..." -ForegroundColor Cyan
        Set-Location server
        npx prisma migrate dev --name init
        npx prisma generate
        Set-Location ..
    }
}

# Create uploads directory
if (Test-Path "server") {
    if (-not (Test-Path "server/uploads")) {
        Write-Host "Creating uploads directory..." -ForegroundColor Cyan
        New-Item -ItemType Directory -Path "server/uploads" -Force
    }
}

# Build client for production
if ($Production) {
    Write-Host "🏗️ Building for production..." -ForegroundColor Yellow
    Set-Location client
    npm run build
    Set-Location ..
}

# Create start scripts
Write-Host "📝 Creating start scripts..." -ForegroundColor Yellow

# Development start script
$devScript = @"
@echo off
echo Starting Task Management System in development mode...
echo.
echo Starting backend server...
cd server
start "Backend Server" cmd /k "npm run dev"
echo.
echo Starting frontend server...
cd ../client
start "Frontend Server" cmd /k "npm start"
echo.
echo 🚀 Development servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
"@

$devScript | Out-File -FilePath "start-dev.bat" -Encoding ASCII

# Production start script
$prodScript = @"
@echo off
echo Starting Task Management System in production mode...
echo.
echo Starting backend server...
cd server
npm start
"@

$prodScript | Out-File -FilePath "start-prod.bat" -Encoding ASCII

# Create Docker Compose file
$dockerCompose = @"
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: taskmanager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/taskmanager
      JWT_SECRET: your-super-secret-jwt-key
      NODE_ENV: production
    depends_on:
      - postgres
    volumes:
      - ./server/uploads:/app/uploads

  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
      REACT_APP_SOCKET_URL: http://localhost:5000
    depends_on:
      - server

volumes:
  postgres_data:
"@

$dockerCompose | Out-File -FilePath "docker-compose.yml" -Encoding UTF8

# Create server Dockerfile
$serverDockerfile = @"
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
"@

$serverDockerfile | Out-File -FilePath "server/Dockerfile" -Encoding UTF8

# Create client Dockerfile
$clientDockerfile = @"
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
"@

$clientDockerfile | Out-File -FilePath "client/Dockerfile" -Encoding UTF8

# Create nginx config
$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 3000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files `$uri `$uri/ /index.html;
        }

        location /api {
            proxy_pass http://server:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade `$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host `$host;
            proxy_cache_bypass `$http_upgrade;
        }

        location /socket.io {
            proxy_pass http://server:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade `$http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host `$host;
        }
    }
}
"@

$nginxConfig | Out-File -FilePath "client/nginx.conf" -Encoding UTF8

Write-Host "✅ Deployment setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Update server/.env with your database and JWT configuration" -ForegroundColor White
Write-Host "2. Run 'start-dev.bat' for development mode" -ForegroundColor White
Write-Host "3. Or run 'docker-compose up -d' for production mode" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Access URLs:" -ForegroundColor Yellow
Write-Host "   Development: http://localhost:3000" -ForegroundColor White
Write-Host "   API: http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: README.md" -ForegroundColor Yellow 