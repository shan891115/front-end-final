require('dotenv').config();

const express = require('express');
const app = require('./src/app');
const { testFirebaseConnection } = require('./src/firebase/testConnection');

const PORT = process.env.PORT || 3000;

// 調試：檢查環境變數是否正確載入
console.log('環境變數檢查:');
console.log('PORT:', process.env.PORT);
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? '已設定' : '未設定');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '已設定' : '未設定');

// 測試 Firebase 連接
async function startServer() {
  try {
    // 在啟動前進行 Firebase 連接測試
    await testFirebaseConnection();
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('服務器啟動錯誤:', error);
    console.error('Firebase 連接失敗，請檢查您的配置和服務帳號設置。');
    console.error('您仍然可以使用其他功能，但儲存比較數據可能會失敗。');
    
    // 即使 Firebase 連接失敗，也啟動服務器
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT} (Firebase 連接失敗)`);
    });
  }
}

startServer();