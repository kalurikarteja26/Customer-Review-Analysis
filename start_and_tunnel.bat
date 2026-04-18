@echo off
echo Starting Oracle-Commerce Intelligence Ecosystem Locally...

echo Starting Backend...
cd backend
start cmd /k "python -m uvicorn main:app --port 5000"
cd ..

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo ========================================================
echo System is starting up locally!
echo Backend API running at: http://127.0.0.1:5000
echo Frontend UI running at: http://localhost:5173
echo Please open http://localhost:5173 in your browser.
echo ========================================================
pause
