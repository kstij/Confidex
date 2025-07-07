@echo off
echo 🚀 Starting Your Feedback Platform Startup...
echo.

echo 📦 Starting Backend Server...
cd server
start "Backend Server" cmd /k "npm start"
cd ..

echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Starting Frontend Server...
cd client
start "Frontend Server" cmd /k "npm start"
cd ..

echo.
echo ✅ Your startup is starting up!
echo.
echo 📍 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo 🧪 Test Page: http://localhost:3000/test
echo.
echo 🎉 Your anonymous feedback platform is ready!
echo.
pause 