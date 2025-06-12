# Task Manager Installation Script
Write-Host "Installing Task Manager dependencies..." -ForegroundColor Green

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install server dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Yellow
cd server
npm install
cd ..

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
cd client
npm install
cd ..

Write-Host "Installation completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy server/env.example to server/.env and configure your database" -ForegroundColor White
Write-Host "2. Run 'npm run db:migrate' to set up the database" -ForegroundColor White
Write-Host "3. Run 'npm run dev' to start both server and client" -ForegroundColor White 