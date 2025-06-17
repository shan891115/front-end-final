# Clean test and temporary files PowerShell script
Write-Host "Cleaning test and temporary files..." -ForegroundColor Green

# Define files to delete
$filesToDelete = @(
    "analyze-real-itinerary.js",
    "attraction-category-test.html",
    "clear-test-photos.html",
    "debug-attraction-extraction-fixed.js",
    "debug-attraction-extraction.js", 
    "debug-attraction-final.js",
    "debug-regex.js",
    "final-test-extraction.js",
    "firebase-init-check.js",
    "photo-category-demo.html",
    "test-api.js",
    "test-backend.js",
    "test-cors-fix.html",
    "test-final-extractor.mjs",
    "test-final-fix.js",
    "test-firebase-integration.html",
    "test-firebase-storage-fixed.html",
    "test-fixed-extraction.js",
    "test-fixed-logic.js",
    "test-fixed-real-format.js",
    "test-frontend-data.js",
    "test-frontend-integration.html",
    "test-improved-extractor.mjs",
    "test-local-storage.js",
    "test-photospage-simulation.js",
    "test-real-data.js",
    "test-real-format.js",
    "test-regex-simple.js",
    "test-user-path-storage.html",
    "launch-config.json",
    "launch-project.bat",
    "launch-project.ps1",
    "start-servers.js",
    "improved-extractor-code.js",
    "src\improved-attraction-extractor-clean.js",
    "src\improved-attraction-extractor-fixed.js", 
    "src\improved-attraction-extractor.js",
    "CORS_FIX_STATUS.md",
    "CORS_QUICK_FIX_REPORT.md",
    "FIREBASE_STORAGE_UPLOAD_FIX.md",
    "FIRESTORE_400_ERROR_FIX.md",
    "USER_PATH_STORAGE_UPDATE.md",
    "fix-summary.txt"
)

# Wildcard patterns for files to delete
$wildcardPatterns = @(
    "firebase-firestore-rules*.txt",
    "firebase-storage-rules*.txt",  
    "travel-comparison-api\test-*.js"
)

$deletedCount = 0

# Delete specific files
foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "Deleted: $file" -ForegroundColor Yellow
        $deletedCount++
    }
}

# Delete wildcard matched files
foreach ($pattern in $wildcardPatterns) {
    $matchedFiles = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    foreach ($file in $matchedFiles) {
        Remove-Item $file.FullName -Force
        Write-Host "Deleted: $($file.Name)" -ForegroundColor Yellow
        $deletedCount++
    }
}

Write-Host ""
Write-Host "Cleanup completed!" -ForegroundColor Green
Write-Host "Deleted $deletedCount files" -ForegroundColor Cyan
Write-Host "The project is now ready to be pushed to GitHub." -ForegroundColor Green

Read-Host "Press Enter to continue..."
