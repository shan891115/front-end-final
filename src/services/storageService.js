// src/services/storageService.js
const COMPARISON_STORAGE_KEY = 'recent_comparisons';
const MAX_STORED_COMPARISONS = 5; // 最多儲存的比較數量

export const storageService = {
  // 儲存比較結果
  saveComparison(comparison) {
    try {
      // 獲取現有的比較結果
      const storedComparisons = this.getComparisons();
      
      // 添加新的比較結果（帶時間戳）
      const newComparison = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data: comparison
      };
      
      // 將新的比較結果添加到列表前面
      storedComparisons.unshift(newComparison);
      
      // 限制儲存數量
      const limitedComparisons = storedComparisons.slice(0, MAX_STORED_COMPARISONS);
      
      // 儲存到 localStorage
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(limitedComparisons));
      
      return newComparison.id;
    } catch (error) {
      console.error('儲存比較結果失敗:', error);
      return null;
    }
  },
  
  // 獲取所有比較結果
  getComparisons() {
    try {
      const storedData = localStorage.getItem(COMPARISON_STORAGE_KEY);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('獲取比較結果失敗:', error);
      return [];
    }
  },
  
  // 根據 ID 獲取特定比較結果
  getComparisonById(id) {
    const comparisons = this.getComparisons();
    return comparisons.find(comp => comp.id === id) || null;
  },
  
  // 刪除特定比較結果
  deleteComparison(id) {
    try {
      const comparisons = this.getComparisons();
      const filteredComparisons = comparisons.filter(comp => comp.id !== id);
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(filteredComparisons));
      return true;
    } catch (error) {
      console.error('刪除比較結果失敗:', error);
      return false;
    }
  },
  
  // 清除所有比較結果
  clearAllComparisons() {
    localStorage.removeItem(COMPARISON_STORAGE_KEY);
  }
};