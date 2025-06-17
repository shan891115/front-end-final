// travel-comparison-api/src/services/cleanupService.js
const { getDatabase, ref, get, remove } = require('firebase/database');

class CleanupService {
  // 設定定時清理任務
  setupCleanupTask() {
    // 每天執行一次清理
    setInterval(() => {
      this.cleanupExpiredComparisons();
    }, 24 * 60 * 60 * 1000); // 24小時
  }

  // 清理過期的比較資料
  async cleanupExpiredComparisons() {
    try {
      console.log('開始清理過期比較資料...');
      const db = getDatabase();
      const comparisonsRef = ref(db, 'comparisons');
      const snapshot = await get(comparisonsRef);
      
      if (!snapshot.exists()) {
        return;
      }
      
      const now = Date.now();
      const comparisons = snapshot.val();
      let expiredCount = 0;
      
      // 檢查每個比較資料是否過期
      for (const [id, data] of Object.entries(comparisons)) {
        if (data.expiresAt && data.expiresAt < now) {
          await remove(ref(db, `comparisons/${id}`));
          expiredCount++;
        }
      }
      
      console.log(`清理完成，已刪除 ${expiredCount} 筆過期資料`);
    } catch (error) {
      console.error('清理過期資料錯誤:', error);
    }
  }
}

module.exports = new CleanupService();