@echo off
echo Starting Sentix-Prime Global Intelligence Stack...

:: 1. Start Docker Services (Backend, Scraper, Redis, Monitoring)
echo Starting Docker containers...
docker-compose up -d

:: 2. Start Frontend in a new window
echo Starting Frontend UI...
start cmd /k "cd frontend && npm run dev"

:: 3. Open the application in the browser
timeout /t 5
start http://localhost:5173

echo ========================================================
echo SYSTEM IS RUNNING!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo Monitoring: http://localhost:3001 (admin/admin)
echo ========================================================
pause
