# 快速部署後端到 Vercel

Write-Host "🚀 開始部署後端到 Vercel..." -ForegroundColor Green

# 檢查是否在正確的目錄
if (-not (Test-Path "travel-comparison-api")) {
    Write-Host "❌ 錯誤：請確保在專案根目錄執行此腳本" -ForegroundColor Red
    exit 1
}

# 進入後端目錄
Set-Location travel-comparison-api

# 檢查是否有 vercel 命令
try {
    vercel --version | Out-Null
} catch {
    Write-Host "❌ 請先安裝 Vercel CLI: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# 部署到 Vercel
Write-Host "📦 正在部署後端..." -ForegroundColor Yellow
vercel --prod

Write-Host "✅ 後端部署完成！" -ForegroundColor Green
Write-Host "📝 請記下 Vercel 提供的 URL，並更新前端的 .env.production 文件" -ForegroundColor Cyan
Write-Host "📝 格式：VITE_API_BASE_URL=https://your-backend-app.vercel.app/api" -ForegroundColor Cyan

# 返回原目錄
Set-Location ..

Write-Host "🔄 接下來請更新 .env.production 並重新部署前端" -ForegroundColor Blue
