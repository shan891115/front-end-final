# Firebase 服務帳號設定指南

為了讓 API 伺服器能夠成功連接到 Firebase Realtime Database 並獲得寫入權限，您需要設定 Firebase 服務帳號。

## 步驟 1: 建立 Firebase 服務帳號

1. 登入您的 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案 (final-compare)
3. 點擊左側導航欄的 ⚙️ (設定) 圖標
4. 選擇「專案設定」
5. 切換到「服務帳號」標籤
6. 點擊「產生新的私鑰」按鈕
7. 下載產生的 JSON 檔案

## 步驟 2: 放置服務帳號檔案

將下載的 JSON 檔案重命名為 `service-account.json`，然後放在以下目錄：

```
src/firebase/credentials/service-account.json
```

注意：此檔案包含敏感資訊，請確保不要將它上傳到公開的 Git 儲存庫。確認 `.gitignore` 檔案中已添加此路徑。

## 步驟 3: 或使用環境變數

如果您無法直接使用檔案（如在某些部署環境中），可以將 JSON 內容設為環境變數：

```
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id",...}
```

## 服務帳號檔案格式

服務帳號 JSON 檔案的內容格式如下：

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxx%40your-project-id.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

## 更新 Firebase 規則

一旦您設置好服務帳號，API 伺服器將會以授權用戶的身分訪問 Firebase。您當前的 Firebase 規則僅允許服務帳號訪問特定路徑：

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

這些規則只允許已驗證的用戶（包括服務帳號）讀取和寫入 `some_path` 路徑下的數據。本項目的所有資料現在都存儲在此路徑下。
