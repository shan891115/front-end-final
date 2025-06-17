/**
 * Firebase 配置檔案
 * 
 * 本檔案集中管理 Firebase 相關配置
 */

module.exports = {
  // 數據庫 URL
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  
  // 服務帳號檔案路徑 (相對於專案根目錄)
  serviceAccountPath: 'src/firebase/credentials/service-account.json',
  
  // 最大數據存儲時間 (預設 7 天，以毫秒為單位)
  dataRetentionMs: 7 * 24 * 60 * 60 * 1000,
  
  // 數據清理頻率 (預設每天檢查一次，以毫秒為單位)
  cleanupIntervalMs: 24 * 60 * 60 * 1000,
    // 資料表名稱
  tables: {
    comparisons: 'some_path/comparisons',
    tests: 'some_path/tests'
  }
};
