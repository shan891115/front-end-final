// travel-comparison-api/src/services/firebaseService.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 定義服務帳號憑證文件的路徑
const serviceAccountPath = path.join(__dirname, '../firebase/credentials/service-account.json');

// 硬編碼的 Firebase 配置 (備用)
const hardcodedConfig = {
  databaseURL: "https://final-compare-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// 初始化 Firebase Admin
let adminApp;
let database;

try {
  // 優先順序: 1.環境變數 2.服務帳號文件 3.硬編碼配置
  let credential = null;
  let dbUrl = process.env.FIREBASE_DATABASE_URL || hardcodedConfig.databaseURL;
  
  console.log('\n===== Firebase Admin 初始化 =====');
  
  // 方法 1: 嘗試使用環境變數 (適用於 Vercel 部署)
  if (process.env.FIREBASE_ADMIN_SDK_KEY) {
    console.log('使用環境變數初始化 Firebase Admin...');
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY);
      credential = admin.credential.cert(serviceAccount);
      console.log('✅ 環境變數服務帳戶憑證解析成功');
    } catch (error) {
      console.error('❌ 環境變數服務帳戶憑證解析失敗:', error.message);
    }
  }
  
  // 方法 2: 嘗試使用服務帳號文件 (適用於本地開發)
  if (!credential && fs.existsSync(serviceAccountPath)) {
    console.log('使用服務帳號文件初始化...');
    const serviceAccount = require(serviceAccountPath);
    credential = admin.credential.cert(serviceAccount);
    console.log('✅ 服務帳戶文件讀取成功');
  }
  // 方法 2: 嘗試使用環境變數中的服務帳號
  else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PROJECT_ID) {
    console.log('使用環境變數服務帳號初始化...');
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // 注意: 環境變數中的換行符轉換
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    });
  }
  
  // 初始化 Firebase Admin
  if (credential) {
    // 使用服務帳號憑證
    adminApp = admin.initializeApp({
      credential: credential,
      databaseURL: dbUrl
    });
    console.log('✅ Firebase Admin 初始化成功 (使用服務帳號)');
  } else {
    // 嘗試使用默認憑證 (這在生產環境可能不工作)
    console.warn('⚠️ 未找到服務帳號，使用默認方式初始化...');
    adminApp = admin.initializeApp({
      databaseURL: dbUrl
    });
    console.log('⚠️ Firebase Admin 初始化完成 (無服務帳號，可能權限受限)');
  }
  
  // 獲取數據庫實例
  database = admin.database();
  
} catch (error) {
  console.error('❌ Firebase Admin 初始化失敗:', error);
  // 在這裡不拋出錯誤，讓應用程序可以繼續運行
  // 相關功能的調用將單獨處理錯誤
}

class FirebaseService {    // 測試 Firebase 連接和身份驗證
  async saveTestData(testData) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }
      
      const testRef = database.ref('tests');
      const newTestRef = testRef.push();
      await newTestRef.set(testData);
      return {
        id: newTestRef.key
      };
    } catch (error) {
      console.error('儲存測試數據錯誤:', error);
      throw error;
    }
  }
  
  // 刪除測試數據
  async deleteTestData(id) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }
      
      await database.ref(`tests/${id}`).remove();
      return true;
    } catch (error) {
      console.error('刪除測試數據錯誤:', error);
      throw error;
    }
  }
  // 儲存比較結果，返回唯一ID
  async saveComparison(comparisonData) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }
      
      // 使用 Admin SDK 生成唯一 ID 並儲存資料
      const comparisonsRef = database.ref('comparisons');
      const newComparisonRef = comparisonsRef.push();
    
      // 添加時間戳和過期時間 (預設7天)
      const timestamp = Date.now();
      const expiresAt = timestamp + (7 * 24 * 60 * 60 * 1000); // 7天後過期
    
      // 清理 undefined 值
      const cleanData = JSON.parse(JSON.stringify(comparisonData));
  
      const dataToSave = {
        ...cleanData,
        timestamp,
        expiresAt
      };
    
      // 使用 Admin SDK 儲存資料
      await newComparisonRef.set(dataToSave);
      
      // 返回生成的 ID
      return {
          id: newComparisonRef.key,
          expiresAt
      };
    } catch (error) {
      console.error('儲存比較資料錯誤:', error);
      throw error;
    }
  }
    // 根據 ID 獲取比較結果
  async getComparison(id) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }
      
      // 使用 Admin SDK 獲取數據
      const comparisonRef = database.ref(`comparisons/${id}`);
      const snapshot = await comparisonRef.once('value');
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // 檢查是否已過期
        if (data.expiresAt && data.expiresAt < Date.now()) {
          // 已過期，刪除資料
          await comparisonRef.remove();
          return null;
        }
        
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('獲取比較資料錯誤:', error);
      throw error;
    }
  }
    // 儲存行程，返回唯一ID (按用戶分離)
  async saveItinerary(itineraryData) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }

      const { userId } = itineraryData;
      if (!userId) {
        throw new Error('缺少用戶 ID');
      }
        // 使用用戶 ID 建立專屬路徑
      const userItinerariesRef = database.ref(`users/${userId}/itineraries`);
      const newItineraryRef = userItinerariesRef.push();
    
      // 添加時間戳和過期時間 (預設30天)
      const timestamp = Date.now();
      const expiresAt = timestamp + (30 * 24 * 60 * 60 * 1000); // 30天後過期
    
      // 清理 undefined 值
      const cleanData = JSON.parse(JSON.stringify(itineraryData));
  
      const dataToSave = {
        ...cleanData,
        timestamp,
        expiresAt
      };
    
      // 使用 Admin SDK 儲存資料
      await newItineraryRef.set(dataToSave);
      
      console.log(`行程已儲存到用戶 ${userId} 的專屬路徑:`, newItineraryRef.key);
      
      // 返回生成的 ID
      return {
          id: newItineraryRef.key,
          expiresAt
      };
    } catch (error) {
      console.error('儲存行程資料錯誤:', error);
      throw error;
    }
  }
    // 根據 ID 獲取行程 (需要用戶 ID 以確保安全性)
  async getItinerary(id, userId) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }

      if (!userId) {
        throw new Error('缺少用戶 ID');
      }
        // 使用用戶專屬路徑獲取數據
      const itineraryRef = database.ref(`users/${userId}/itineraries/${id}`);
      const snapshot = await itineraryRef.once('value');
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // 檢查是否已過期
        if (data.expiresAt && data.expiresAt < Date.now()) {
          // 已過期，刪除資料
          await itineraryRef.remove();
          return null;
        }
        
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('獲取行程資料錯誤:', error);
      throw error;
    }
  }
  
  // 獲取所有行程列表
  async getAllItineraries() {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }
      
      // 使用 Admin SDK 獲取數據
      const itinerariesRef = database.ref('itineraries');
      const snapshot = await itinerariesRef.once('value');
      
      if (snapshot.exists()) {
        const itineraries = [];
        snapshot.forEach(childSnapshot => {
          const data = childSnapshot.val();
          
          // 檢查是否已過期
          if (!data.expiresAt || data.expiresAt > Date.now()) {
            itineraries.push({
              id: childSnapshot.key,
              ...data
            });
          }
        });
        
        return itineraries;
      } else {
        return [];
      }
    } catch (error) {
      console.error('獲取行程列表錯誤:', error);
      throw error;
    }
  }
  // 獲取特定用戶的行程列表
  async getUserItineraries(userId) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }

      if (!userId) {
        throw new Error('缺少用戶 ID');
      }
      
      console.log(`正在獲取用戶 ${userId} 的行程列表...`);
      
      // 首先嘗試從新路徑獲取
      const userItinerariesRef = database.ref(`users/${userId}/itineraries`);
      const snapshot = await userItinerariesRef.once('value');
      
      if (snapshot.exists()) {
        console.log(`在新路徑找到用戶 ${userId} 的行程資料`);
        const itineraries = [];
        snapshot.forEach(childSnapshot => {
          const data = childSnapshot.val();
          
          // 檢查是否已過期
          if (!data.expiresAt || data.expiresAt > Date.now()) {
            itineraries.push({
              id: childSnapshot.key,
              ...data
            });
          } else {
            // 如果已過期，刪除該項目
            childSnapshot.ref.remove().catch(error => {
              console.error('刪除過期行程失敗:', error);
            });
          }
        });
        
        // 按建立時間降序排序 (最新的在前面)
        itineraries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        console.log(`用戶 ${userId} 的行程數量:`, itineraries.length);
        return itineraries;
      } else {
        console.log(`新路徑沒有找到用戶 ${userId} 的行程，檢查舊路徑...`);
        
        // 嘗試從舊路徑獲取並遷移 (如果有的話)
        const oldItinerariesRef = database.ref(`some_path/users/${userId}/itineraries`);
        const oldSnapshot = await oldItinerariesRef.once('value');
        
        if (oldSnapshot.exists()) {
          console.log(`在舊路徑找到用戶 ${userId} 的行程，開始遷移...`);
          const itineraries = [];
          const migrationPromises = [];
          
          oldSnapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            
            // 檢查是否已過期
            if (!data.expiresAt || data.expiresAt > Date.now()) {
              itineraries.push({
                id: childSnapshot.key,
                ...data
              });
              
              // 遷移到新路徑
              const migrationPromise = userItinerariesRef.child(childSnapshot.key).set(data)
                .then(() => {
                  console.log(`已遷移行程 ${childSnapshot.key} 到新路徑`);
                  // 刪除舊路徑的資料
                  return childSnapshot.ref.remove();
                })
                .catch(error => {
                  console.error(`遷移行程 ${childSnapshot.key} 失敗:`, error);
                });
              
              migrationPromises.push(migrationPromise);
            }
          });
          
          // 等待所有遷移完成
          await Promise.all(migrationPromises);
          
          // 按建立時間降序排序
          itineraries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          
          console.log(`用戶 ${userId} 的行程遷移完成，數量:`, itineraries.length);
          return itineraries;
        } else {          console.log(`用戶 ${userId} 沒有任何行程資料`);
          return [];
        }
      }
    } catch (error) {
      console.error('獲取用戶行程列表錯誤:', error);      throw error;
    }
  }

  // 刪除特定用戶的指定行程
  async deleteUserItinerary(userId, itineraryId) {
    try {
      if (!database) {
        throw new Error('Firebase 數據庫未初始化');
      }

      if (!userId || !itineraryId) {
        throw new Error('缺少用戶 ID 或行程 ID');
      }
        // 使用用戶專屬路徑刪除特定行程
      const itineraryRef = database.ref(`users/${userId}/itineraries/${itineraryId}`);
      await itineraryRef.remove();
      
      console.log(`已刪除用戶 ${userId} 的行程 ${itineraryId}`);
      return { success: true };
    } catch (error) {
      console.error('刪除用戶行程錯誤:', error);
      throw error;
    }
  }
}

module.exports = new FirebaseService();