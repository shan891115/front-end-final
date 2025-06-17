# GitHub 上傳前檢查清單

## 📋 上傳前必做檢查

### 1. 🧹 清理測試文件
- [ ] 執行 `clean-for-github.bat` 或 `clean-for-github.ps1`
- [ ] 確認所有測試文件已刪除

### 2. 🔒 環境變量檢查
- [ ] 確認 `.env` 文件不會被上傳 (已在 .gitignore)
- [ ] 檢查代碼中是否有硬編碼的 API 密鑰
- [ ] 確認 Firebase 配置文件安全

### 3. 📄 文件檢查
- [ ] 確認 `package.json` 信息正確
- [ ] 更新 `README.md` 包含項目說明
- [ ] 檢查是否有不必要的大文件

### 4. 🔧 功能檢查
- [ ] 執行 `npm run build` 確認能正常打包
- [ ] 測試主要功能是否正常

## 📁 保留的核心文件結構

```
final_project/
├── public/           # 靜態資源
├── src/             # 源代碼
│   ├── App.vue
│   ├── main.js
│   ├── assets/
│   ├── components/
│   ├── router/
│   ├── services/
│   ├── utils/
│   └── views/
├── travel-comparison-api/  # 後端 API
│   ├── src/
│   ├── server.js
│   └── package.json
├── package.json
├── vite.config.js
├── README.md
└── .gitignore
```

## 🚫 已排除的文件類型

- 所有 `test-*.js`、`debug-*.js` 文件
- 臨時改進版本文件 (`improved-*.js`)
- 開發文檔和修復記錄 (`.md` 文件)
- 啟動腳本 (`launch-*.bat/ps1`)
- Firebase 規則文件 (如有敏感信息)

## 📝 建議的 README.md 內容

你的項目應該包含：
1. 項目簡介和功能
2. 技術棧說明
3. 安裝和運行指南
4. 項目結構說明
5. 環境變量配置說明

## 🔄 Git 推送步驟

```bash
# 1. 初始化 Git (如果還沒有)
git init

# 2. 添加遠程倉庫
git remote add origin <your-github-repo-url>

# 3. 添加文件
git add .

# 4. 提交
git commit -m "Initial commit: Travel comparison web application"

# 5. 推送到 GitHub
git push -u origin main
```

## ⚠️ 注意事項

1. **敏感信息**: 確保沒有 API 密鑰、密碼等敏感信息
2. **大文件**: 避免上傳不必要的大文件
3. **測試數據**: 不要上傳測試用的真實數據
4. **依賴**: 讓 npm/yarn 來管理依賴，不要上傳 node_modules

準備好後，就可以安全地推送到 GitHub 了！
