require('dotenv').config();

// 確保生產環境設置
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const express = require('express');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// 調試：檢查環境變數是否正確載入
console.log('環境變數檢查:');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? '已設定' : '未設定');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '已設定' : '未設定');

// 啟動服務器（移除 Firebase 連接測試以避免阻塞）
console.log('正在啟動服務器...');

// 對於 Vercel，導出 app 而不是啟動監聽
if (process.env.VERCEL) {
  // 在 Vercel 環境中，直接導出 app
  module.exports = app;
} else {
  // 在本地環境中，啟動服務器
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// 可選：異步測試 Firebase 連接，但不阻塞服務器啟動
setTimeout(async () => {
  try {
    const { testFirebaseConnection } = require('./src/firebase/testConnection');
    await testFirebaseConnection();
    console.log('✅ Firebase 連接測試成功');
  } catch (error) {
    console.warn('⚠️  Firebase 連接測試失敗:', error.message);
    console.warn('⚠️  Firebase 相關功能可能無法使用，但其他功能正常');
  }
}, 1000);