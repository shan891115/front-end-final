# 用戶專屬行程儲存功能實作

## 問題說明
原先的系統將所有使用者的行程都儲存在同一個 Firebase 路徑 `some_path/itineraries` 下，沒有按使用者分離，導致使用者可以看到其他人的行程。

## 解決方案
重新設計儲存架構，讓每個使用者擁有專屬的行程儲存空間。

## 修改的檔案與內容

### 1. 前端 - AdvicePage.vue

#### 修改內容：
- **confirmAndSaveToFirebase()**: 添加用戶 ID 到行程資料中
- **loadSavedItineraries()**: 改為從雲端載入用戶專屬行程
- **deleteItinerary()**: 改為從雲端刪除用戶專屬行程
- **導入**: 添加 currentUser 導入
- **computed**: 添加 currentUser 計算屬性

#### 新的儲存邏輯：
```javascript
// 添加用戶資訊到行程資料
const userItineraryData = {
  ...itineraryData,
  userId: userInfo.uid || currentUser.value?.uid,
  userEmail: userInfo.email || currentUser.value?.email
};
```

### 2. 前端 - aiService.js

#### 修改內容：
- **getItineraries()**: 添加 userId 參數
- **getItineraryById()**: 添加 userId 參數  
- **deleteItinerary()**: 新增刪除行程方法

### 3. 後端 - ai.js (路由)

#### 修改內容：
- **POST /save-itinerary**: 添加用戶 ID 驗證
- **GET /itineraries**: 改為按用戶過濾行程
- **GET /itineraries/:id**: 添加用戶 ID 驗證
- **DELETE /itineraries/:id**: 新增刪除行程路由

### 4. 後端 - firebaseService.js

#### 修改內容：
- **saveItinerary()**: 改為按用戶 ID 分離儲存
- **getItinerary()**: 添加用戶 ID 驗證
- **getUserItineraries()**: 新增獲取用戶專屬行程方法
- **deleteUserItinerary()**: 新增刪除用戶行程方法

#### 新的儲存結構：
```
Firebase Database 結構：
some_path/
  users/
    {userId}/
      itineraries/
        {itineraryId}/
          - title
          - content
          - country
          - days
          - userId
          - userEmail
          - timestamp
          - expiresAt
          - ...
```

## 功能改進

### 1. 安全性提升
- 每個使用者只能訪問自己的行程
- 所有 API 都需要用戶 ID 驗證
- 刪除和查看行程都需要用戶身份驗證

### 2. 資料隔離
- 不同使用者的行程完全分離
- 避免資料洩露和混亂

### 3. 使用者體驗改善
- 使用者看到的是自己專屬的行程列表
- 刪除確認對話框
- 詳細的錯誤提示

## 測試建議

1. **多使用者測試**：
   - 用不同帳號登入
   - 各自建立行程
   - 確認無法看到其他人的行程

2. **權限測試**：
   - 未登入狀態下嘗試儲存行程
   - 嘗試訪問其他人的行程 ID

3. **功能測試**：
   - 儲存行程
   - 載入專屬行程列表
   - 刪除行程
   - 查看行程詳情

## 後續建議

1. **添加行程分享功能**：讓使用者可以選擇性分享行程給其他人
2. **行程分類**：讓使用者可以為行程添加標籤或分類
3. **行程模板**：允許使用者將行程設為模板供他人參考
4. **行程協作**：允許多人共同編輯一個行程

## 注意事項

- 確保所有前端調用都包含正確的 userId
- 後端 API 都需要驗證用戶身份
- Firebase 規則需要相應調整以支援新的資料結構
- 考慮舊有資料的遷移方案（如有需要）
