@echo off
chcp 65001 >nul
echo Cleaning test and temporary files...

REM Delete test files in root directory
if exist "analyze-real-itinerary.js" del /q "analyze-real-itinerary.js"
if exist "attraction-category-test.html" del /q "attraction-category-test.html"
if exist "clear-test-photos.html" del /q "clear-test-photos.html"
if exist "debug-attraction-extraction-fixed.js" del /q "debug-attraction-extraction-fixed.js"
if exist "debug-attraction-extraction.js" del /q "debug-attraction-extraction.js"
if exist "debug-attraction-final.js" del /q "debug-attraction-final.js"
if exist "debug-regex.js" del /q "debug-regex.js"
if exist "final-test-extraction.js" del /q "final-test-extraction.js"
if exist "firebase-init-check.js" del /q "firebase-init-check.js"
if exist "photo-category-demo.html" del /q "photo-category-demo.html"
if exist "test-api.js" del /q "test-api.js"
if exist "test-backend.js" del /q "test-backend.js"
if exist "test-cors-fix.html" del /q "test-cors-fix.html"
if exist "test-final-extractor.mjs" del /q "test-final-extractor.mjs"
if exist "test-final-fix.js" del /q "test-final-fix.js"
if exist "test-firebase-integration.html" del /q "test-firebase-integration.html"
if exist "test-firebase-storage-fixed.html" del /q "test-firebase-storage-fixed.html"
if exist "test-fixed-extraction.js" del /q "test-fixed-extraction.js"
if exist "test-fixed-logic.js" del /q "test-fixed-logic.js"
if exist "test-fixed-real-format.js" del /q "test-fixed-real-format.js"
if exist "test-frontend-data.js" del /q "test-frontend-data.js"
if exist "test-frontend-integration.html" del /q "test-frontend-integration.html"
if exist "test-improved-extractor.mjs" del /q "test-improved-extractor.mjs"
if exist "test-local-storage.js" del /q "test-local-storage.js"
if exist "test-photospage-simulation.js" del /q "test-photospage-simulation.js"
if exist "test-real-data.js" del /q "test-real-data.js"
if exist "test-real-format.js" del /q "test-real-format.js"
if exist "test-regex-simple.js" del /q "test-regex-simple.js"
if exist "test-user-path-storage.html" del /q "test-user-path-storage.html"

REM Delete temporary config and launch files
if exist "launch-config.json" del /q "launch-config.json"
if exist "launch-project.bat" del /q "launch-project.bat"
if exist "launch-project.ps1" del /q "launch-project.ps1"
if exist "start-servers.js" del /q "start-servers.js"

REM Delete improved version files
if exist "improved-extractor-code.js" del /q "improved-extractor-code.js"
if exist "src\improved-attraction-extractor-clean.js" del /q "src\improved-attraction-extractor-clean.js"
if exist "src\improved-attraction-extractor-fixed.js" del /q "src\improved-attraction-extractor-fixed.js"
if exist "src\improved-attraction-extractor.js" del /q "src\improved-attraction-extractor.js"

REM Delete development documentation
if exist "CORS_FIX_STATUS.md" del /q "CORS_FIX_STATUS.md"
if exist "CORS_QUICK_FIX_REPORT.md" del /q "CORS_QUICK_FIX_REPORT.md"
if exist "FIREBASE_STORAGE_UPLOAD_FIX.md" del /q "FIREBASE_STORAGE_UPLOAD_FIX.md"
if exist "FIRESTORE_400_ERROR_FIX.md" del /q "FIRESTORE_400_ERROR_FIX.md"
if exist "USER_PATH_STORAGE_UPDATE.md" del /q "USER_PATH_STORAGE_UPDATE.md"
if exist "fix-summary.txt" del /q "fix-summary.txt"

REM Delete Firebase rules files
for %%f in (firebase-firestore-rules*.txt) do if exist "%%f" del /q "%%f"
for %%f in (firebase-storage-rules*.txt) do if exist "%%f" del /q "%%f"

REM Delete API test files
for %%f in (travel-comparison-api\test-*.js) do if exist "%%f" del /q "%%f"

echo.
echo Cleanup completed!
echo All test and temporary files have been deleted.
echo The project is now ready to be pushed to GitHub.
echo.
pause
