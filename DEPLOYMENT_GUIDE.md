# 部署指南 - 解決後端連接問題

## 問題分析
你的前端已成功部署到 Vercel，但後端 API 連接失敗，因為：
1. 前端代碼中使用了硬編碼的 `http://localhost:3333/api`
2. 生產環境中無法訪問 localhost

## 解決方案

### 1. 前端配置已修復 ✅
- 修改了 `src/services/aiService.js` 使用動態 API URL
- 修改了 `src/views/AdvicePage.vue` 使用動態 API URL
- 創建了 `.env.production` 文件

### 2. 後端部署 - 通過 Vercel 網站 (推薦)

#### 步驟 1: 準備後端代碼
已完成：`travel-comparison-api/vercel.json` 配置文件已創建 ✅

#### 步驟 2: 通過 Vercel 網站部署

##### 方法 A: 如果已經部署過，直接重新部署
1. 訪問 [Vercel Dashboard](https://vercel.com/dashboard)
2. 登入你的帳號
3. 找到之前部署的後端專案 (travel-comparison-api)
4. 點擊專案名稱進入專案頁面
5. 點擊右上角的 "Redeploy" 或 "Deploy" 按鈕
6. 選擇最新的 commit 或手動上傳檔案
7. 等待部署完成

##### 方法 B: 全新部署後端
1. 訪問 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. 選擇你的 Git 倉庫（GitHub/GitLab/Bitbucket）
4. 找到包含 `travel-comparison-api` 的倉庫
5. 點擊 "Import"
6. **重要**：在 "Configure Project" 頁面：
   - **Root Directory**: 設置為 `travel-comparison-api`
   - **Framework Preset**: 選擇 "Other"
   - **Build Command**: 保持空白或填入 `npm install`
   - **Output Directory**: 保持空白
   - **Install Command**: `npm install`

##### 方法 C: 手動上傳檔案
1. 在 Vercel Dashboard 點擊 "New Project"
2. 選擇 "Browse" 手動上傳
3. 將整個 `travel-comparison-api` 資料夾拖拽上傳
4. 等待上傳完成後點擊 "Deploy"

#### 步驟 3: 設置環境變數
在 Vercel 專案設置中添加以下環境變數：
1. 在專案頁面點擊 "Settings" 標籤
2. 點擊左側的 "Environment Variables"
3. 添加必要的環境變數：
   ```
   NODE_ENV=production
   FIREBASE_ADMIN_SDK_KEY=你的Firebase服務帳戶密鑰
   FIRECRAWL_API_KEY=你的Firecrawl API密鑰
   GEMINI_API_KEY=你的Gemini API密鑰
   ```

#### 步驟 4: 獲取後端 URL
部署完成後，Vercel 會提供一個 URL，格式類似：
```
https://your-backend-app.vercel.app
```

### 3. 更新前端配置

#### 步驟 1: 更新環境變數
編輯 `.env.production` 文件：
```bash
# 將 your-backend-app 替換為實際的 Vercel 應用名稱
VITE_API_BASE_URL=https://your-backend-app.vercel.app/api
```

#### 步驟 2: 重新部署前端
1. 提交並推送代碼到 Git
2. Vercel 會自動重新部署前端
3. 或在 Vercel Dashboard 手動觸發重新部署

### 4. 替代部署方法

#### 選項 B: 部署到其他平台
- **Railway**: 
  1. 訪問 [Railway](https://railway.app)
  2. 連接 GitHub 倉庫
  3. 選擇 `travel-comparison-api` 目錄
  
- **Render**: 
  1. 訪問 [Render](https://render.com)
  2. 創建新的 Web Service
  3. 連接 Git 倉庫並設置根目錄

### 5. 測試部署

部署完成後，測試以下端點：
1. `https://your-backend-app.vercel.app/api` - 應該返回 API 狀態
2. `https://your-backend-app.vercel.app/api/ai/health` - 健康檢查
3. 前端應用不再顯示連接錯誤

### 6. 常見問題排除

#### 問題 1: 部署失敗
- 檢查 `vercel.json` 文件是否正確
- 確認 `package.json` 中的 dependencies 完整
- 檢查環境變數是否設置正確

#### 問題 2: API 調用仍然失敗
- 確認前端的 `.env.production` 已更新
- 檢查 CORS 設置
- 檢查後端 API 端點是否正確

#### 問題 3: 環境變數問題
- 在 Vercel Dashboard 中檢查環境變數設置
- 確認 Firebase 和 API 密鑰正確

## 檢查清單
- [ ] 後端已通過 Vercel 網站部署
- [ ] 獲得了後端 URL
- [ ] 前端 `.env.production` 已更新
- [ ] 前端已重新部署
- [ ] 環境變數已在 Vercel 中設置
- [ ] API 端點測試正常
- [ ] 前端不再顯示 localhost 錯誤

## 快速命令參考

如果要安裝 Vercel CLI（可選）：
```powershell
npm install -g vercel
```

但推薦直接使用網站部署，更簡單可靠。
