@echo off
title Sentix-Prime Unified Native Startup
echo =================================================================
echo   RESTORE MODE: Running Sentix-Prime Natively (No Docker)
echo =================================================================

:: Check for .env
if not exist .env (
    echo [WARNING] .env file not found! Gemini AI features will be disabled.
    echo Please create a .env file with GEMINI_API_KEY=your_key
)

:: 1. Start Redis (if available locally)
echo [1/4] Starting Redis...
start "Sentix-Redis" /min docker run --rm -p 6379:6379 redis:7-alpine

:: 2. Start Scraper
echo [2/4] Starting Scraper Service...
cd scraper
start "Sentix-Scraper" /min cmd /c "npm install && node server.js"
cd ..

:: 3. Start Backend
echo [3/4] Starting FastAPI Backend...
start "Sentix-API" /min cmd /c "python -m venv venv && venv\Scripts\activate && pip install -r backend/requirements.txt && python -m uvicorn backend.main:app --host 0.0.0.0 --port 5000"

:: 4. Start Frontend
echo [4/4] Starting Frontend Dev Server...
cd frontend
start "Sentix-Frontend" cmd /c "npm install && npm run dev"
cd ..

echo =================================================================
echo   SUCCESS: All services are launching in separate windows.
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo   - Scraper:  http://localhost:3000
echo =================================================================
pause
