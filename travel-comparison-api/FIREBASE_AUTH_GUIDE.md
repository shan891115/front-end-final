# Firebase 身份驗證實施指南

您的 Firebase 數據庫權限問題已成功解決。本文檔說明了實施的解決方案及如何使用。

## 已實施的解決方案

1. **Firebase Admin SDK 整合**：
   - 安裝了 firebase-admin 套件
   - 配置了服務帳號認證系統 
   - 更新了 Firebase 服務以使用 Admin SDK

2. **服務帳號身份驗證**：
   - 支援從文件讀取服務帳號 (`service-account.json`)
   - 支援從環境變數讀取服務帳號 (`FIREBASE_SERVICE_ACCOUNT_JSON`)
   - 自動退回到其他身份驗證方法

3. **錯誤處理與彈性**：
   - 即使 Firebase 連接失敗，API 仍然能夠返回比較結果
   - 啟動時進行 Firebase 連接測試
   - 前端 aiService.js 添加了適當的錯誤處理

## 如何使用

要使用此解決方案，您需要執行以下步驟：

### 1. 從 Firebase 控制台獲取服務帳號金鑰

1. 登入 [Firebase 控制台](https://console.firebase.google.com/)
2. 選擇您的專案
3. 點擊左側導航欄的 ⚙️ 圖標
4. 選擇「專案設定」
5. 切換到「服務帳號」標籤
6. 點擊「產生新的私鑰」按鈕
7. 下載產生的 JSON 檔案

### 2. 設置服務帳號

**選項 1：使用服務帳號檔案**

將下載的 JSON 檔案重命名為 `service-account.json`，並放在：

```
travel-comparison-api/src/firebase/credentials/service-account.json
```

**選項 2：使用環境變數**

在 `.env` 檔案中添加以下內容：

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id",...}
```

### 3. 確認您的 Firebase 規則

確保您的 Firebase 規則允許身份驗證用戶訪問 `some_path` 資料：

```json
{
  "rules": {
    "some_path": {
      ".read": "auth.uid !== null",
      ".write": "auth.uid !== null"
    }
  }
}
```

注意：應用程式已經更新為只從 `some_path` 路徑讀寫資料。

## 測試連接

當伺服器啟動時，它會自動測試 Firebase 連接。如果連接失敗，您會在控制台中看到詳細的錯誤訊息，幫助您診斷問題。

## 問題排除

如果您遇到問題，請檢查：

1. 服務帳號檔案是否正確配置
2. Firebase 數據庫 URL 是否正確
3. Firebase 規則是否允許服務帳號寫入
4. 環境變數是否正確設置

## 注意事項

- 服務帳號檔案包含敏感資訊，已添加到 `.gitignore` 中
- 即使 Firebase 存儲失敗，比較功能仍能正常工作
- 規則設置為 `auth != null` 表示只有認證用戶才能讀寫數據

如有任何疑問，請參考 [Firebase Admin SDK 文檔](https://firebase.google.com/docs/admin/setup)。
