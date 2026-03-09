@echo off
echo === SchichtBlitz starten ===
echo.

echo [1/4] Docker PostgreSQL starten...
docker compose up -d
if %errorlevel% neq 0 (
    echo FEHLER: Docker konnte nicht gestartet werden. Ist Docker Desktop aktiv?
    pause
    exit /b 1
)

echo [2/4] Warte auf PostgreSQL...
timeout /t 3 /nobreak >nul

echo [3/4] Prisma Migration + Seed...
call npx prisma migrate dev --name init 2>nul
call npx prisma db seed 2>nul

echo [4/4] Dev-Server starten...
echo.
echo === http://localhost:3000 ===
echo.
npm run dev
