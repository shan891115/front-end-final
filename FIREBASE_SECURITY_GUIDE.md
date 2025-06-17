# Firebase 安全配置檢查清單

## 🔒 為什麼 Vercel 會顯示警示

Vercel 檢測到包含 `AUTH` 關鍵字的環境變數並且以 `VITE_` 開頭，這表示它會被打包到前端代碼中，任何人都可以在瀏覽器開發者工具中看到。

## ✅ Firebase Web API Key 的特殊性

**好消息：Firebase Web API Key 設計就是要公開的！**

- Firebase Web API Key 不像傳統的 API 密鑰
- 它只是用來識別你的 Firebase 專案
- 真正的安全性由 Firebase 安全規則控制

## 🛡️ 推薦的安全措施

### 1. 確認 Firebase 安全規則

**Firestore 規則** (應該類似)：
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允許經過身份驗證的用戶讀寫自己的數據
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 公開讀取的數據（如景點信息）
    match /attractions/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage 規則**：
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. 在 Firebase Console 中限制 API Key

1. 登入 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案
3. 到 `設定` > `專案設定` > `一般`
4. 在 `網頁 API 金鑰` 區域點擊限制
5. 添加你的網域限制：
   - `localhost:5173` (開發)
   - `your-vercel-domain.vercel.app` (生產)

### 3. 啟用 Firebase App Check（推薦）

App Check 可以保護你的 Firebase 資源免受濫用：

```javascript
// 在 main.js 中添加
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// 初始化 App Check
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('your-recaptcha-site-key'),
  isTokenAutoRefreshEnabled: true
});
```

### 4. 監控使用情況

- 定期檢查 Firebase Console 中的使用統計
- 設置配額和預算警報
- 監控異常的 API 調用

## 🎯 結論

**對於你的專案：**
- ✅ 可以安全地忽略 Vercel 的警示
- ✅ Firebase Web API Key 公開是正常的
- ⚠️ 確保 Firebase 安全規則已正確設置
- 🔧 考慮添加網域限制和 App Check

## 📝 檢查項目

- [ ] Firebase 安全規則已設置並測試
- [ ] API Key 已限制網域
- [ ] 啟用了必要的 Firebase 服務
- [ ] 監控和警報已設置
- [ ] 考慮啟用 App Check

Firebase 的安全模型與傳統 API 不同，Web API Key 的公開是設計的一部分！
