@echo off
echo Cleaning test and temporary files...

REM Test files
del /q test-*.js 2>nul
del /q test-*.mjs 2>nul
del /q test-*.html 2>nul
del /q debug-*.js 2>nul
del /q analyze-*.js 2>nul

REM Temporary files
del /q launch-*.* 2>nul
del /q start-servers.js 2>nul
del /q improved-*.js 2>nul

REM Documentation
del /q CORS_*.md 2>nul
del /q FIREBASE_*_*.md 2>nul
del /q fix-summary.txt 2>nul

REM Firebase rules
del /q firebase-*-rules*.txt 2>nul

REM API tests
del /q travel-comparison-api\test-*.js 2>nul

REM Cleanup src folder
del /q src\improved-*.js 2>nul

echo.
echo Cleanup completed!
echo Files deleted successfully.
pause
