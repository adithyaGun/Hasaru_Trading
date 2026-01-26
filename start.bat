@echo off
echo Starting Hasaru Trading Application...
echo.

echo Starting Backend Server...
start "Hasaru Trading Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
start "Hasaru Trading Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window (servers will continue running)...
pause >nul