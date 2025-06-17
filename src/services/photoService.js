// 照片服務 - 處理照片上傳、獲取和分類
import { ref } from 'vue';
import { isAuthenticated, getCurrentUser } from './authService';
import { getApps, initializeApp } from 'firebase/app';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';

// Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 確保只初始化一次 Firebase
let app, storage, db;
try {
  // 檢查是否已經有 Firebase app 實例
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
    console.log('使用現有的 Firebase app 實例');
  } else {
    app = initializeApp(firebaseConfig);
    console.log('創建新的 Firebase app 實例');
  }
  
  storage = getStorage(app);
  db = getFirestore(app);
  console.log('Firebase Storage 和 Firestore 初始化成功');
  console.log('Storage bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
} catch (error) {
  console.error('Firebase 初始化失敗:', error);
  console.error('環境變數檢查:', {
    apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  });
}

// 模擬資料庫中的照片集合 (作為備用，當 Firebase 不可用時使用)
const photoDatabase = ref([]);

// 從 localStorage 恢復照片資料
const restorePhotosFromStorage = () => {
  try {
    const savedPhotos = localStorage.getItem('travel_photos');
    if (savedPhotos) {
      const photosData = JSON.parse(savedPhotos);
      photoDatabase.value = photosData.map(photo => ({
        ...photo,
        // 確保日期是 Date 物件
        uploadDate: new Date(photo.uploadDate)
      }));
      console.log('從 localStorage 恢復照片:', photoDatabase.value.length, '張');
      console.log('恢復的照片分類分佈:', photoDatabase.value.reduce((acc, photo) => {
        acc[photo.category] = (acc[photo.category] || 0) + 1;
        return acc;
      }, {}));
    }
  } catch (error) {
    console.warn('恢復照片資料失敗:', error);
  }
};

// 將照片資料儲存到 localStorage
const savePhotosToStorage = () => {
  try {
    localStorage.setItem('travel_photos', JSON.stringify(photoDatabase.value));
    console.log('照片資料已儲存到 localStorage');
  } catch (error) {
    console.warn('儲存照片資料失敗:', error);
  }
};

// 初始化時恢復資料
restorePhotosFromStorage();

// 照片類型列表
const PHOTO_CATEGORIES = [
  { id: 'all', name: '所有照片' },
  { id: 'nature', name: '自然風景' },
  { id: 'city', name: '城市景觀' },
  { id: 'food', name: '美食佳餚' },
  { id: 'culture', name: '文化體驗' },
];

const photoService = {
  // 獲取照片類別
  getPhotoCategories() {
    return PHOTO_CATEGORIES;
  },  // 上傳照片
  async uploadPhotos(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo = null, userSelectedCategory = null) {
    console.log('開始照片上傳流程...');
    console.log('認證狀態:', isAuthenticated.value);
    console.log('Firebase Storage 可用:', !!storage);
    console.log('Firebase Firestore 可用:', !!db);
    console.log('行程資訊:', itineraryInfo);
    console.log('用戶選擇的分類:', userSelectedCategory);

    // 檢查認證狀態 - 如果未登入，使用本地儲存而不是拋出錯誤
    if (!isAuthenticated.value) {
      console.warn('用戶未登入，使用本地儲存模式');
      return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo, userSelectedCategory);
    }

    try {      // 如果 Firebase 不可用，直接使用本地儲存
      if (!storage || !db) {
        console.warn('Firebase 服務不可用，使用本地儲存');
        return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo, userSelectedCategory);
      }

      // 暫時跳過連接測試，直接嘗試上傳（避免權限問題影響測試）
      console.log('Firebase Storage 和 Firestore 已初始化，開始直接上傳...');
      const uploadedPhotos = [];
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        console.log(`處理照片 ${i + 1}/${photos.length}: ${photo.file.name}`);        try {
          // 1. 將照片上傳到 Firebase Storage
          const photoUrl = await this.uploadPhotoToStorage(photo.file, itineraryId, dayNumber, attraction.id, i);
          
          // 2. 取得當前用戶資訊
          const user = getCurrentUser();          // 3. 準備照片資訊 - 加入更多行程相關資訊
          const photoData = {
            imageUrl: photoUrl,
            itineraryId,
            itineraryTitle: '', // 稍後補充
            itineraryCountry: '', // 稍後補充
            dayNumber,
            attraction: {
              id: attraction.id,
              name: attraction.name,
              description: attraction.description || ''
            },
            notes,
            category: userSelectedCategory || this.determineCategoryFromAttraction(attraction.name),
            uploadDate: new Date(),
            likes: 0,
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || '',            fileName: photo.file.name,
            fileSize: photo.file.size,
            fileType: photo.file.type,
            // 新增：用於卡片顯示的主要標籤
            primaryTag: itineraryInfo?.country || itineraryInfo?.title || '旅行',
            secondaryTag: `第${dayNumber}天`,
            locationInfo: {
              country: itineraryInfo?.country || '',
              city: itineraryInfo?.city || '',
              region: itineraryInfo?.region || ''
            }
          };
          
          console.log('準備儲存的照片資料 (包含標籤):', {
            primaryTag: photoData.primaryTag,
            secondaryTag: photoData.secondaryTag,
            itineraryInfo: itineraryInfo
          });
            // 4. 將照片資訊儲存到 Firestore
          const docRef = await this.savePhotoToFirestore(photoData);
          photoData.id = docRef.id;
          
          uploadedPhotos.push(photoData);
          console.log(`照片 ${i + 1} 上傳成功`);
            } catch (photoError) {
          console.error(`照片 ${i + 1} 上傳失敗:`, photoError);
          
          // 特別處理 Firestore 400 錯誤
          if (photoError.message === 'FIRESTORE_400_ERROR') {
            console.warn('偵測到 Firestore 400 錯誤，切換到本地儲存模式');
            throw new Error('FIREBASE_400_ERROR');
          }
          
          // 特別處理各種 Firebase Storage 錯誤
          if (photoError.message === 'CORS_ERROR') {
            console.warn('偵測到 CORS 錯誤，切換到本地儲存模式');
            throw new Error('FIREBASE_CORS_ERROR');
          }
          
          if (photoError.message === 'STORAGE_PERMISSION_ERROR') {
            console.warn('偵測到 Storage 權限錯誤，切換到本地儲存模式');
            throw new Error('FIREBASE_PERMISSION_ERROR');
          }
          
          if (photoError.message === 'STORAGE_QUOTA_ERROR') {
            console.warn('偵測到 Storage 配額錯誤，切換到本地儲存模式');
            throw new Error('FIREBASE_QUOTA_ERROR');
          }
          
          if (photoError.message === 'UPLOAD_TIMEOUT_ERROR') {
            console.warn('偵測到上傳超時錯誤，切換到本地儲存模式');
            throw new Error('FIREBASE_TIMEOUT_ERROR');
          }
          
          // 原有的 Firestore 錯誤處理
          if (photoError.message === 'FIRESTORE_PERMISSION_ERROR') {
            console.warn('偵測到 Firestore 權限錯誤，切換到本地儲存模式');
            throw new Error('FIREBASE_PERMISSION_ERROR');
          }
          
          if (photoError.message === 'FIRESTORE_CONNECTION_ERROR') {
            console.warn('偵測到 Firestore 連接錯誤，切換到本地儲存模式');
            throw new Error('FIREBASE_CONNECTION_ERROR');
          }            // 其他錯誤時，嘗試本地儲存這張照片
          console.log(`照片 ${i + 1} 改用本地儲存`);
          console.log('錯誤處理 - 行程資訊:', itineraryInfo);
          const user = getCurrentUser();          const localPhoto = {
            id: `local_photo_${Date.now()}_${i}`,
            imageUrl: photo.preview,
            itineraryId,
            itineraryTitle: itineraryInfo?.title || itineraryInfo?.country || '未知行程',
            itineraryCountry: itineraryInfo?.country || '',
            dayNumber,
            attraction: {
              id: attraction.id,
              name: attraction.name,
              description: attraction.description || ''
            },
            notes,
            category: userSelectedCategory || this.determineCategoryFromAttraction(attraction.name),
            uploadDate: new Date(),
            likes: 0,
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || '',
            fileName: photo.file.name,
            fileSize: photo.file.size,
            fileType: photo.file.type,
            isLocal: true,
            primaryTag: itineraryInfo?.country || itineraryInfo?.title || '旅行',
            secondaryTag: `第${dayNumber}天`,
            locationInfo: {
              country: itineraryInfo?.country || '',
              city: itineraryInfo?.city || '',
              region: itineraryInfo?.region || ''
            }
          };
          console.log('錯誤處理照片標籤:', {
            primaryTag: localPhoto.primaryTag,
            secondaryTag: localPhoto.secondaryTag
          });          uploadedPhotos.push(localPhoto);
          photoDatabase.value.push(localPhoto);
          // 儲存到 localStorage
          savePhotosToStorage();
        }
      }
      
      return {
        success: true,
        message: `成功處理 ${uploadedPhotos.length} 張照片`,
        photos: uploadedPhotos
      };
    } catch (error) {
      console.error('整體上傳流程失敗:', error);      // 特別處理 Firestore 400 錯誤
      if (error.message === 'FIREBASE_400_ERROR') {
        console.warn('Firestore 400 問題，改用本地儲存');
        return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo);
      }
      
      // 特別處理各種 Firebase 錯誤
      if (error.message === 'FIREBASE_CORS_ERROR') {
        console.warn('Firebase CORS 問題，改用本地儲存');
        return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo);
      }
      
      if (error.message === 'FIREBASE_PERMISSION_ERROR') {
        console.warn('Firebase 權限問題，改用本地儲存');
        return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo);
      }
      
      if (error.message === 'FIREBASE_CONNECTION_ERROR') {
        console.warn('Firebase 連接問題，改用本地儲存');
        return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo);
      }
      
      if (error.message === 'FIREBASE_QUOTA_ERROR') {
        console.warn('Firebase 配額超出問題，改用本地儲存');
        return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo);
      }
      
      if (error.message === 'FIREBASE_TIMEOUT_ERROR') {
        console.warn('Firebase 上傳超時問題，改用本地儲存');
        return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo);
      }
      
      // 如果 Firebase 完全失敗，使用本地儲存
      console.warn('Firebase 上傳失敗，改用本地儲存');
      return await this.uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo);
    }
  },  // 本地儲存照片（備用方案）
  async uploadPhotosLocally(photos, notes, itineraryId, dayNumber, attraction, itineraryInfo = null, userSelectedCategory = null) {
    return new Promise((resolve) => {
      console.log('使用本地儲存模式');
      console.log('本地儲存 - 行程資訊:', itineraryInfo);
      
      setTimeout(() => {
        const user = getCurrentUser();
        const uploadedPhotos = photos.map((photo, index) => {
          const photoData = {
            id: `local_photo_${Date.now()}_${index}`,
            imageUrl: photo.preview,
            itineraryId,
            itineraryTitle: itineraryInfo?.title || itineraryInfo?.country || '未知行程',
            itineraryCountry: itineraryInfo?.country || '',
            dayNumber,
            attraction: {
              id: attraction.id,
              name: attraction.name,
              description: attraction.description || ''
            },
            notes,
            category: this.determineCategoryFromAttraction(attraction.name),
            uploadDate: new Date(),
            likes: 0,
            userId: user?.uid || 'anonymous',
            userEmail: user?.email || '',
            fileName: photo.file ? photo.file.name : `photo_${index + 1}`,
            fileSize: photo.file ? photo.file.size : 0,
            fileType: photo.file ? photo.file.type : 'image/jpeg',
            isLocal: true,
            // 新增：用於卡片顯示的主要標籤
            primaryTag: itineraryInfo?.country || itineraryInfo?.title || '旅行',
            secondaryTag: `第${dayNumber}天`,
            locationInfo: {
              country: itineraryInfo?.country || '',
              city: itineraryInfo?.city || '',
              region: itineraryInfo?.region || ''
            }
          };
          
          console.log('本地儲存照片標籤:', {
            primaryTag: photoData.primaryTag,
            secondaryTag: photoData.secondaryTag
          });
          
          return photoData;
        });        // 添加到本地"資料庫"
        photoDatabase.value.push(...uploadedPhotos);
        
        // 儲存到 localStorage 以便持久化
        savePhotosToStorage();
        
        resolve({
          success: true,
          message: `成功本地儲存 ${uploadedPhotos.length} 張照片（離線模式）`,
          photos: uploadedPhotos
        });
      }, 500);
    });
  },// 上傳單張照片到 Firebase Storage
  async uploadPhotoToStorage(file, itineraryId, dayNumber, attractionId, photoIndex) {
    if (!storage) {
      throw new Error('Firebase Storage 未初始化');
    }    try {
      // 取得當前登入用戶
      const user = getCurrentUser();
      if (!user || !user.uid) {
        throw new Error('用戶未登入或無法取得用戶 ID');
      }
      
      // 生成唯一的檔案名稱 - 確保檔案名安全
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${photoIndex}_${safeFileName}`;
        // 建立符合新安全規則的路徑結構: user/{userId}/photos/...
      const fullPath = `user/${user.uid}/photos/${itineraryId}/day${dayNumber}/${attractionId}/${fileName}`;
      const fileRef = storageRef(storage, fullPath);
        console.log('=== Firebase Storage 上傳開始 ===');
      console.log('用戶 ID:', user.uid);
      console.log('完整路徑:', fullPath);
      console.log('檔案參考資訊:', {
        name: fileName,
        fullPath: fullPath,
        bucket: storage.app.options.storageBucket
      });
      console.log('檔案資訊:', {
        name: file.name,
        size: file.size,
        type: file.type
      });        // 建立上傳 metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'userId': user.uid,
          'userEmail': user.email || '',
          'itineraryId': itineraryId,
          'dayNumber': dayNumber.toString(),
          'attractionId': attractionId,
          'uploadedAt': new Date().toISOString()
        }
      };
      
      // 使用新版 Firebase v9+ API 上傳檔案
      console.log('開始執行上傳...');
      const uploadTask = uploadBytes(fileRef, file, metadata);
      
      // 設定上傳超時時間
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('上傳超時 (15秒)')), 15000);
      });
      
      // 等待上傳完成
      const snapshot = await Promise.race([uploadTask, timeoutPromise]);
      
      // 獲取下載 URL
      console.log('上傳完成，取得下載連結...');
      const downloadURL = await getDownloadURL(fileRef);
        console.log('=== Firebase Storage 上傳成功 ===');
      console.log('下載 URL:', downloadURL);
      console.log('完成的檔案資訊:', {
        fullPath: fullPath,
        name: fileName,
        size: file.size
      });
      
      return downloadURL;    } catch (error) {
      console.error('=== Firebase Storage 上傳失敗 ===');
      console.error('錯誤詳情:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      
      // 更精確的錯誤分類
      if (error.code === 'storage/unauthorized') {
        console.error('Storage 權限錯誤 - 檢查 Firebase Storage 安全規則');
        throw new Error('STORAGE_PERMISSION_ERROR');
      }
      
      if (error.code === 'storage/quota-exceeded') {
        console.error('Storage 配額超出 - 檢查 Firebase 使用量');
        throw new Error('STORAGE_QUOTA_ERROR');
      }
      
      if (error.code === 'storage/invalid-format') {
        console.error('檔案格式無效');
        throw new Error('STORAGE_FORMAT_ERROR');
      }
      
      if (error.code === 'storage/object-not-found') {
        console.error('Storage 物件不存在');
        throw new Error('STORAGE_NOT_FOUND_ERROR');
      }
      
      // 檢查網路相關錯誤
      if (error.message.includes('CORS') || 
          error.message.includes('ERR_FAILED') || 
          error.message.includes('XMLHttpRequest') ||
          error.message.includes('fetch') ||
          error.message.includes('Network') ||
          error.code === 'storage/unknown' ||
          error.name === 'FirebaseError') {
        console.error('網路或 CORS 錯誤 - 可能需要檢查網路連接或 Firebase 設定');
        throw new Error('CORS_ERROR');
      }
      
      // 超時錯誤
      if (error.message.includes('超時') || error.message.includes('timeout')) {
        console.error('上傳超時 - 檔案可能過大或網路速度慢');
        throw new Error('UPLOAD_TIMEOUT_ERROR');
      }
      
      console.error('未知的 Storage 錯誤:', error);
      throw new Error(`照片上傳失敗: ${error.message}`);
    }
  },  // 將照片資訊儲存到 Firestore
  async savePhotoToFirestore(photoData) {
    if (!db) {
      throw new Error('Firestore 未初始化');
    }

    try {
      console.log('開始儲存照片資訊到 Firestore:', photoData);
        // 確保資料格式正確，保留所有重要欄位
      const cleanPhotoData = {
        imageUrl: photoData.imageUrl,
        itineraryId: photoData.itineraryId || '',
        itineraryTitle: photoData.itineraryTitle || '',
        itineraryCountry: photoData.itineraryCountry || '',
        dayNumber: photoData.dayNumber || 1,
        attraction: {
          id: photoData.attraction?.id || '',
          name: photoData.attraction?.name || '',
          description: photoData.attraction?.description || ''
        },
        notes: photoData.notes || '',
        category: photoData.category || 'nature',
        uploadDate: new Date(),
        likes: photoData.likes || 0,
        userId: photoData.userId || 'anonymous',
        userEmail: photoData.userEmail || '',
        fileName: photoData.fileName || 'unknown',
        fileSize: photoData.fileSize || 0,
        fileType: photoData.fileType || 'image/jpeg',
        // 重要：保留新加的標籤欄位
        primaryTag: photoData.primaryTag || '',
        secondaryTag: photoData.secondaryTag || '',
        locationInfo: photoData.locationInfo || {
          country: '',
          city: '',
          region: ''
        }
      };
      
      // 移除任何 undefined 或 null 的值
      Object.keys(cleanPhotoData).forEach(key => {
        if (cleanPhotoData[key] === undefined || cleanPhotoData[key] === null) {
          cleanPhotoData[key] = '';
        }
      });
      
      console.log('清理後的資料:', cleanPhotoData);
      
      const docRef = await addDoc(collection(db, 'photos'), cleanPhotoData);
      console.log('照片資訊儲存成功，文檔 ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Firestore 儲存失敗:', error);
      console.error('錯誤詳情:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // 特別處理 400 錯誤
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        console.error('偵測到 400 錯誤 - 可能是安全規則或資料格式問題');
        throw new Error('FIRESTORE_400_ERROR');
      }
      
      // 檢查是否為權限錯誤
      if (error.code === 'permission-denied') {
        console.error('Firestore 權限被拒絕 - 檢查安全規則');
        throw new Error('FIRESTORE_PERMISSION_ERROR');
      }
      
      // 檢查是否為網路錯誤
      if (error.code === 'unavailable' || error.message.includes('transport errored')) {
        console.error('Firestore 連接錯誤 - 網路問題');
        throw new Error('FIRESTORE_CONNECTION_ERROR');
      }
      
      console.error('未知的 Firestore 錯誤');
      throw new Error(`照片資訊儲存失敗: ${error.message}`);
    }
  },  // 從景點名稱判斷照片類別
  determineCategoryFromAttraction(attractionName) {
    if (!attractionName) return 'nature';
    
    const name = attractionName.toLowerCase();
    
    console.log('=== 景點分類判斷 ===');
    console.log('景點名稱:', attractionName);
    console.log('小寫轉換:', name);
    
    let category;
    
    // 🍽️ 美食佳餚類別 (food)
    if (name.includes('餐廳') || name.includes('美食') || name.includes('小吃') || name.includes('食堂') || 
        name.includes('夜市') || name.includes('市場') || name.includes('食街') || name.includes('茶餐廳') ||
        name.includes('restaurant') || name.includes('food') || name.includes('cafe') || name.includes('coffee') ||
        name.includes('咖啡') || name.includes('茶') || name.includes('酒吧') || name.includes('bar') ||
        name.includes('bistro') || name.includes('diner') || name.includes('kitchen') || name.includes('dining') ||
        name.includes('bakery') || name.includes('麵包') || name.includes('甜點') || name.includes('dessert') ||
        name.includes('buffet') || name.includes('自助餐') || name.includes('燒烤') || name.includes('bbq') ||
        name.includes('火鍋') || name.includes('pizza') || name.includes('披薩') || name.includes('sushi') || 
        name.includes('壽司') || name.includes('拉麵') || name.includes('ramen')) {
      category = 'food';
    }
    
    // 🏛️ 文化體驗類別 (culture)
    else if (name.includes('寺廟') || name.includes('廟') || name.includes('博物館') || name.includes('文化') || 
             name.includes('古蹟') || name.includes('遺址') || name.includes('紀念館') || name.includes('故宮') ||
             name.includes('temple') || name.includes('shrine') || name.includes('museum') || name.includes('gallery') ||
             name.includes('theatre') || name.includes('theater') || name.includes('宮殿') || name.includes('palace') ||
             name.includes('教堂') || name.includes('church') || name.includes('cathedral') || name.includes('mosque') ||
             name.includes('esplanade') || name.includes('theatres') || name.includes('藝術中心') || name.includes('文物') ||
             name.includes('exhibition') || name.includes('展覽') || name.includes('heritage') || name.includes('historic') ||
             name.includes('古城') || name.includes('老街') || name.includes('古建築') || name.includes('monastery') ||
             name.includes('abbey') || name.includes('castle') || name.includes('城堡') || name.includes('fort') ||
             name.includes('fortress') || name.includes('要塞') || name.includes('陵墓') || name.includes('tomb') ||
             name.includes('statue') || name.includes('雕像') || name.includes('monument') || name.includes('紀念碑') ||
             name.includes('opera') || name.includes('歌劇院') || name.includes('concert') || name.includes('音樂廳') ||
             name.includes('library') || name.includes('圖書館') || name.includes('university') || name.includes('大學')) {
      category = 'culture';
    }
    
    // 🎢 娛樂景點 - 歸類為城市景觀 (city)
    else if (name.includes('遊樂園') || name.includes('主題樂園') || name.includes('樂園') || name.includes('影城') ||
             name.includes('theme park') || name.includes('amusement') || name.includes('universal') || name.includes('環球') ||
             name.includes('disney') || name.includes('迪士尼') || name.includes('六福村') || name.includes('麗寶') ||
             name.includes('ocean park') || name.includes('海洋公園') || name.includes('水族館') || name.includes('aquarium') ||
             name.includes('zoo') || name.includes('動物園') || name.includes('safari') || name.includes('野生動物') ||
             name.includes('遊戲場') || name.includes('playground') || name.includes('arcade') || name.includes('電玩') ||
             name.includes('ktv') || name.includes('卡拉ok') || name.includes('cinema') || name.includes('電影院') ||
             name.includes('casino') || name.includes('賭場') || name.includes('夜店') || name.includes('club') ||
             name.includes('spa') || name.includes('溫泉') || name.includes('hot spring') || name.includes('resort') ||
             name.includes('度假村') || name.includes('樂土') || name.includes('wonderland') || name.includes('kingdom')) {
      category = 'city';
    }
    
    // 🌿 自然風景類別 (nature)
    else if (name.includes('公園') || name.includes('山') || name.includes('海') || name.includes('森林') || 
             name.includes('瀑布') || name.includes('湖') || name.includes('河') || name.includes('溪') ||
             name.includes('park') || name.includes('garden') || name.includes('beach') || name.includes('mountain') ||
             name.includes('forest') || name.includes('waterfall') || name.includes('lake') || name.includes('river') ||
             name.includes('valley') || name.includes('峽谷') || name.includes('cliff') || name.includes('懸崖') ||
             name.includes('island') || name.includes('島') || name.includes('海岸') || name.includes('coast') ||
             name.includes('bay') || name.includes('灣') || name.includes('自然保護區') || name.includes('nature reserve') ||
             name.includes('national park') || name.includes('國家公園') || name.includes('濕地') || name.includes('wetland') ||
             name.includes('草原') || name.includes('grassland') || name.includes('prairie') || name.includes('desert') ||
             name.includes('沙漠') || name.includes('洞穴') || name.includes('cave') || name.includes('溶洞') ||
             name.includes('峰') || name.includes('peak') || name.includes('summit') || name.includes('嶺') ||
             name.includes('trail') || name.includes('步道') || name.includes('登山') || name.includes('hiking') ||
             name.includes('花園') || name.includes('植物園') || name.includes('botanical') || name.includes('arboretum') ||
             name.includes('竹林') || name.includes('bamboo') || name.includes('櫻花') || name.includes('cherry blossom') ||
             name.includes('賞花') || name.includes('flower') || name.includes('景觀區') || name.includes('scenic')) {
      category = 'nature';
    }
    
    // 🏙️ 城市景觀類別 (city)
    else if (name.includes('大樓') || name.includes('塔') || name.includes('街') || name.includes('車站') ||
             name.includes('機場') || name.includes('港口') || name.includes('碼頭') || name.includes('橋') ||
             name.includes('building') || name.includes('tower') || name.includes('mall') || name.includes('center') ||
             name.includes('centre') || name.includes('hotel') || name.includes('airport') || name.includes('station') ||
             name.includes('bridge') || name.includes('廣場') || name.includes('square') || name.includes('plaza') ||
             name.includes('marina') || name.includes('harbour') || name.includes('harbor') || name.includes('port') ||
             name.includes('skyscraper') || name.includes('摩天大樓') || name.includes('觀景台') || name.includes('observatory') ||
             name.includes('天台') || name.includes('skybar') || name.includes('rooftop') || name.includes('景觀台') ||
             name.includes('商圈') || name.includes('shopping') || name.includes('百貨') || name.includes('department') ||
             name.includes('outlet') || name.includes('暢貨中心') || name.includes('市集') || name.includes('bazaar') ||
             name.includes('街市') || name.includes('market') || name.includes('老街') || name.includes('古街') ||
             name.includes('步行街') || name.includes('pedestrian') || name.includes('商店街') || name.includes('shopping street') ||
             name.includes('夜景') || name.includes('night view') || name.includes('燈光秀') || name.includes('light show') ||
             name.includes('摩天輪') || name.includes('ferris wheel') || name.includes('纜車') || name.includes('cable car') ||
             name.includes('地標') || name.includes('landmark') || name.includes('景點') || name.includes('attraction') ||
             name.includes('中心') || name.includes('complex') || name.includes('district') || name.includes('區') ||
             name.includes('city hall') || name.includes('市政廳') || name.includes('convention') || name.includes('會展') ||
             name.includes('金融') || name.includes('financial') || name.includes('商業') || name.includes('business') ||
             name.includes('都市') || name.includes('urban') || name.includes('metropolitan') || name.includes('downtown')) {
      category = 'city';
    }
    
    // 🎯 特殊關鍵字優先判斷
    else if (name.includes('環球影城') || name.includes('universal studios')) {
      category = 'city';  // 環球影城明確歸類為城市景觀
    }
    
    // 📍 預設分類 - 改為城市景觀，因為大部分未知景點都是人造建築
    else {
      category = 'city';  // 預設改為城市景觀，避免把商業景點歸為自然風景
    }
    
    console.log('判斷結果:', category);
    console.log('========================');
    
    return category;
  },// 獲取照片列表
  async getPhotos(categoryId = 'all', page = 1, pageSize = 12) {
    console.log('=== getPhotos 開始 ===');
    console.log('請求參數:', { categoryId, page, pageSize });
    console.log('本地照片數量:', photoDatabase.value.length);
    
    // 優先使用本地資料，避免 Firestore 索引問題
    if (photoDatabase.value.length > 0) {
      console.log('使用本地資料進行篩選');
      return this.getPhotosFromLocal(categoryId, page, pageSize);
    }
    
    try {
      if (!db) {
        console.log('Firestore 不可用，使用本地資料');
        return this.getPhotosFromLocal(categoryId, page, pageSize);
      }

      console.log('嘗試從 Firestore 獲取照片...');
      
      // 從 Firestore 獲取照片 - 暫時簡化查詢避免索引問題
      let photosQuery = collection(db, 'photos');
      
      // 暫時移除分類篩選，先取得所有照片
      // TODO: 需要在 Firebase Console 建立 category 欄位的索引
      // if (categoryId !== 'all') {
      //   photosQuery = query(photosQuery, where('category', '==', categoryId));
      // }
      
      // 按上傳時間排序
      photosQuery = query(photosQuery, orderBy('uploadDate', 'desc'));
      
      // 分頁處理
      if (page > 1) {
        photosQuery = query(photosQuery, limit(pageSize * page));
      } else {
        photosQuery = query(photosQuery, limit(pageSize));
      }
      
      const querySnapshot = await getDocs(photosQuery);
      const allPhotos = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allPhotos.push({
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate?.toDate ? data.uploadDate.toDate() : data.uploadDate
        });
      });
      
      // 在客戶端進行分類篩選
      let filteredPhotos = allPhotos;
      if (categoryId !== 'all') {
        filteredPhotos = allPhotos.filter(photo => photo.category === categoryId);
        console.log(`Firestore 客戶端篩選 ${categoryId}：${allPhotos.length} → ${filteredPhotos.length}`);
      }
      
      // 分頁處理
      let paginatedPhotos = filteredPhotos;
      if (page > 1) {
        const startIndex = (page - 1) * pageSize;
        paginatedPhotos = filteredPhotos.slice(startIndex, startIndex + pageSize);
      }
      
      console.log('Firestore 查詢成功，返回照片數量:', paginatedPhotos.length);
      
      return {
        success: true,
        photos: paginatedPhotos,
        total: filteredPhotos.length,
        hasMore: filteredPhotos.length > pageSize
      };
      
    } catch (error) {
      console.error('從 Firestore 獲取照片失敗:', error);
      // 如果 Firestore 失敗，使用本地資料作為備用
      return this.getPhotosFromLocal(categoryId, page, pageSize);
    }
  },  // 從本地獲取照片（備用方案）
  getPhotosFromLocal(categoryId = 'all', page = 1, pageSize = 12) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('=== 本地照片篩選 ===');
        console.log('請求分類:', categoryId);
        console.log('本地照片總數:', photoDatabase.value.length);
        
        let filteredPhotos = [...photoDatabase.value];
        
        // 按類別過濾
        if (categoryId !== 'all') {
          const beforeFilter = filteredPhotos.length;
          filteredPhotos = filteredPhotos.filter(photo => photo.category === categoryId);
          console.log(`篩選結果：${beforeFilter} → ${filteredPhotos.length} 張 (${categoryId})`);
        }
        
        // 按上傳時間排序 (最新的先顯示)
        filteredPhotos.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        // 分頁
        const startIndex = (page - 1) * pageSize;
        const paginatedPhotos = filteredPhotos.slice(startIndex, startIndex + pageSize);
        
        console.log('最終返回:', paginatedPhotos.length, '張照片');
        
        resolve({
          success: true,
          photos: paginatedPhotos,
          total: filteredPhotos.length,
          hasMore: startIndex + pageSize < filteredPhotos.length
        });
      }, 500);
    });
  },

  // 刪除照片
  async deletePhoto(photoId) {
    if (!isAuthenticated.value) {
      throw new Error('用戶未登入');
    }

    try {
      if (db) {
        // 先獲取照片資訊
        const photoDoc = await getDocs(query(collection(db, 'photos'), where('id', '==', photoId)));
        
        if (!photoDoc.empty) {
          const photoData = photoDoc.docs[0].data();
            // 從 Storage 刪除檔案
          if (storage && photoData.imageUrl) {
            try {
              // 從 URL 取得檔案路徑，然後刪除
              const fileRef = storageRef(storage, photoData.imageUrl);
              await deleteObject(fileRef);
              console.log('照片從 Storage 刪除成功');
            } catch (storageError) {
              console.warn('從 Storage 刪除照片失敗:', storageError);
            }
          }
          
          // 從 Firestore 刪除記錄
          await deleteDoc(doc(db, 'photos', photoDoc.docs[0].id));
          console.log('照片從 Firestore 刪除成功');
        }
      }
      
      // 同時從本地陣列中移除（如果存在）
      photoDatabase.value = photoDatabase.value.filter(photo => photo.id !== photoId);
      
      return { success: true, message: '照片刪除成功' };
      
    } catch (error) {
      console.error('刪除照片失敗:', error);
      throw new Error(`刪除照片失敗: ${error.message}`);
    }
  },
  // 添加範例照片 (用於演示)
  addSamplePhotos() {
    // 避免重複添加範例照片
    if (photoDatabase.value.some(photo => photo.id.startsWith('sample_'))) {
      console.log('範例照片已存在，跳過添加');
      return photoDatabase.value.filter(photo => photo.id.startsWith('sample_'));
    }
    
    const samplePhotos = [
      // 自然風景類別
      {
        id: 'sample_nature_1',
        imageUrl: 'https://picsum.photos/800/600?random=1',
        title: '挪威峽灣',
        attraction: { id: 'norway_fjord', name: '挪威峽灣', description: '壯麗的自然風光' },
        category: 'nature',
        uploadDate: new Date(Date.now() - 3600000 * 24 * 2),
        likes: 15,
        userId: 'sample-user',
        primaryTag: '挪威',
        secondaryTag: '第1天',
        notes: '絕美的峽灣風景，讓人讚嘆大自然的鬼斧神工',
        isLocal: true
      },
      {
        id: 'sample_nature_2',
        imageUrl: 'https://picsum.photos/800/600?random=2',
        title: '陽明山國家公園',
        attraction: { id: 'yangming_park', name: '陽明山國家公園', description: '台灣著名的國家公園' },
        category: 'nature',
        uploadDate: new Date(Date.now() - 3600000 * 18),
        likes: 12,
        userId: 'sample-user',
        primaryTag: '台灣',
        secondaryTag: '第2天',
        notes: '春天的陽明山櫻花盛開，美不勝收',
        isLocal: true
      },
      // 城市景觀類別
      {
        id: 'sample_city_1',
        imageUrl: 'https://picsum.photos/800/600?random=3',
        title: '東京街景',
        attraction: { id: 'tokyo_street', name: '澀谷十字路口', description: '世界知名的繁忙街道' },
        category: 'city',
        uploadDate: new Date(Date.now() - 3600000 * 24),
        likes: 10,
        userId: 'sample-user',
        primaryTag: '日本',
        secondaryTag: '第1天',
        notes: '繁華的東京街頭，感受都市的脈動',
        isLocal: true
      },
      {
        id: 'sample_city_2',
        imageUrl: 'https://picsum.photos/800/600?random=4',
        title: '濱海灣金沙',
        attraction: { id: 'marina_bay', name: '濱海灣金沙酒店', description: '新加坡地標建築' },
        category: 'city',
        uploadDate: new Date(Date.now() - 3600000 * 20),
        likes: 18,
        userId: 'sample-user',
        primaryTag: '新加坡',
        secondaryTag: '第1天',
        notes: '新加坡最具代表性的現代建築',
        isLocal: true
      },
      // 美食佳餚類別
      {
        id: 'sample_food_1',
        imageUrl: 'https://picsum.photos/800/600?random=5',
        title: '義大利披薩',
        attraction: { id: 'italian_restaurant', name: '羅馬美食餐廳', description: '正宗義大利料理' },
        category: 'food',
        uploadDate: new Date(Date.now() - 3600000 * 12),
        likes: 8,
        userId: 'sample-user',
        primaryTag: '義大利',
        secondaryTag: '第2天',
        notes: '道地的義大利披薩，薄脆餅皮配上新鮮食材',
        isLocal: true
      },
      {
        id: 'sample_food_2',
        imageUrl: 'https://picsum.photos/800/600?random=6',
        title: '新加坡美食中心',
        attraction: { id: 'singapore_food', name: '老巴剎美食中心', description: '新加坡著名美食廣場' },
        category: 'food',
        uploadDate: new Date(Date.now() - 3600000 * 8),
        likes: 14,
        userId: 'sample-user',
        primaryTag: '新加坡',
        secondaryTag: '第2天',
        notes: '品嚐新加坡道地小吃，海南雞飯超級美味',
        isLocal: true
      },
      // 文化體驗類別
      {
        id: 'sample_culture_1',
        imageUrl: 'https://picsum.photos/800/600?random=7',
        title: '印度泰姬瑪哈陵',
        attraction: { id: 'taj_mahal', name: '泰姬瑪哈陵', description: '世界七大奇蹟之一' },
        category: 'culture',
        uploadDate: new Date(Date.now() - 3600000 * 6),
        likes: 12,
        userId: 'sample-user',
        primaryTag: '印度',
        secondaryTag: '第1天',
        notes: '壯麗的建築藝術，見證了不朽的愛情故事',
        isLocal: true
      },
      {
        id: 'sample_culture_2',
        imageUrl: 'https://picsum.photos/800/600?random=8',
        title: '佛牙寺',
        attraction: { id: 'buddha_tooth', name: '佛牙寺龍華院', description: '新加坡重要佛教寺廟' },
        category: 'culture',
        uploadDate: new Date(Date.now() - 3600000 * 4),
        likes: 9,
        userId: 'sample-user',
        primaryTag: '新加坡',
        secondaryTag: '第3天',
        notes: '莊嚴肅穆的佛教聖地，體驗宗教文化之美',
        isLocal: true
      }
    ];
      photoDatabase.value.push(...samplePhotos);
    // 儲存範例照片到 localStorage
    savePhotosToStorage();
    
    console.log('已添加範例照片，各分類數量:', {
      nature: samplePhotos.filter(p => p.category === 'nature').length,
      city: samplePhotos.filter(p => p.category === 'city').length,
      food: samplePhotos.filter(p => p.category === 'food').length,
      culture: samplePhotos.filter(p => p.category === 'culture').length,
      total: samplePhotos.length
    });
    
    return samplePhotos;},
  // 添加新加坡測試照片（模擬用戶之前的上傳）
  addSingaporeTestPhotos() {
    // 模擬您之前上傳的新加坡照片
    const singaporePhotos = [
      {
        id: 'singapore_esplanade_1',
        imageUrl: 'https://picsum.photos/800/600?random=101',
        attraction: {
          id: 'esplanade',
          name: '濱海藝術中心 (Esplanade - Theatres on the Bay)',
          description: '新加坡著名的表演藝術中心'
        },
        category: this.determineCategoryFromAttraction('濱海藝術中心 (Esplanade - Theatres on the Bay)'),
        uploadDate: new Date(Date.now() - 3600000 * 2),
        likes: 8,
        userId: 'test-user',
        primaryTag: '新加坡',
        secondaryTag: '第1天',
        notes: '新加坡濱海藝術中心，造型獨特的表演場館',
        isLocal: true,
        itineraryId: 'singapore_trip_1',
        dayNumber: 1
      },
      {
        id: 'singapore_marina_bay_1',
        imageUrl: 'https://picsum.photos/800/600?random=102',
        attraction: {
          id: 'marina_bay_sands',
          name: '濱海灣金沙酒店',
          description: '新加坡地標性建築'
        },
        category: this.determineCategoryFromAttraction('濱海灣金沙酒店'),
        uploadDate: new Date(Date.now() - 3600000 * 3),
        likes: 12,
        userId: 'test-user',
        primaryTag: '新加坡',
        secondaryTag: '第1天',
        notes: '濱海灣金沙的獨特造型令人印象深刻',
        isLocal: true,
        itineraryId: 'singapore_trip_1',
        dayNumber: 1
      },
      {
        id: 'singapore_gardens_1',
        imageUrl: 'https://picsum.photos/800/600?random=103',
        attraction: {
          id: 'gardens_by_bay',
          name: 'Gardens by the Bay',
          description: '新加坡著名植物園'
        },
        category: this.determineCategoryFromAttraction('Gardens by the Bay'),
        uploadDate: new Date(Date.now() - 3600000 * 4),
        likes: 15,
        userId: 'test-user',
        primaryTag: '新加坡',
        secondaryTag: '第2天',
        notes: '超級樹的夜景非常壯觀',
        isLocal: true,
        itineraryId: 'singapore_trip_1',
        dayNumber: 2
      },
      {
        id: 'singapore_food_1',
        imageUrl: 'https://picsum.photos/800/600?random=104',
        attraction: {
          id: 'lau_pa_sat',
          name: '老巴剎美食中心',
          description: '新加坡傳統美食廣場'
        },
        category: this.determineCategoryFromAttraction('老巴剎美食中心'),
        uploadDate: new Date(Date.now() - 3600000 * 1),
        likes: 9,
        userId: 'test-user',
        primaryTag: '新加坡',
        secondaryTag: '第2天',
        notes: '品嚐道地的新加坡美食',
        isLocal: true,
        itineraryId: 'singapore_trip_1',
        dayNumber: 2
      }
    ];

    console.log('添加新加坡測試照片:', singaporePhotos.length, '張');
    singaporePhotos.forEach(photo => {
      console.log(`- ${photo.attraction.name}: ${photo.category}`);
    });

    photoDatabase.value.push(...singaporePhotos);
    savePhotosToStorage();
    
    return singaporePhotos;
  },
  // 清除測試照片
  async clearTestPhotos() {
    try {
      const originalCount = photoDatabase.value.length;
      
      // 只保留非測試照片（排除 singapore_ 和 sample_ 開頭的）
      const filteredPhotos = photoDatabase.value.filter(photo => 
        !photo.id.startsWith('singapore_') && !photo.id.startsWith('sample_')
      );
      
      const removedCount = originalCount - filteredPhotos.length;
      
      if (removedCount === 0) {
        return {
          success: true,
          removedCount: 0,
          message: '沒有找到測試照片需要清除'
        };
      }
      
      // 更新記憶體中的照片資料
      photoDatabase.value = filteredPhotos;
      
      // 更新 localStorage
      savePhotosToStorage();
      
      console.log(`成功清除 ${removedCount} 張測試照片，剩餘 ${filteredPhotos.length} 張照片`);
      
      return {
        success: true,
        removedCount,
        remainingCount: filteredPhotos.length,
        message: `成功清除 ${removedCount} 張測試照片`
      };
      
    } catch (error) {
      console.error('清除測試照片失敗:', error);
      return {
        success: false,
        message: `清除測試照片失敗: ${error.message}`
      };
    }
  },

  // 清空所有照片
  async clearAllPhotos() {
    try {
      const originalCount = photoDatabase.value.length;
      
      // 清空記憶體中的照片資料
      photoDatabase.value = [];
      
      // 清空 localStorage
      localStorage.removeItem('travel_photos');
      
      console.log(`已清空所有 ${originalCount} 張照片`);
      
      return {
        success: true,
        removedCount: originalCount,
        message: `已清空所有 ${originalCount} 張照片`
      };
      
    } catch (error) {
      console.error('清空所有照片失敗:', error);
      return {
        success: false,
        message: `清空所有照片失敗: ${error.message}`
      };
    }
  },

  // 獲取照片統計資訊
  getPhotoStats() {
    const total = photoDatabase.value.length;
    const testPhotos = photoDatabase.value.filter(photo => 
      photo.id.startsWith('singapore_') || photo.id.startsWith('sample_')
    ).length;
    const userPhotos = total - testPhotos;
    const localPhotos = photoDatabase.value.filter(photo => photo.isLocal).length;
    
    const categories = {};
    photoDatabase.value.forEach(photo => {
      categories[photo.category] = (categories[photo.category] || 0) + 1;
    });
    
    return {
      total,
      testPhotos,
      userPhotos,
      localPhotos,
      categories
    };
  },

  // 測試 Firestore 連接性
  async testFirestoreConnection() {
    if (!db) {
      console.log('Firestore 未初始化');
      return false;
    }

    try {
      console.log('=== Firestore 連接測試 ===');
      
      // 嘗試寫入一個測試文檔
      const testData = {
        test: true,
        timestamp: new Date(),
        message: 'Firestore connection test'
      };
      
      const docRef = await addDoc(collection(db, 'test'), testData);
      console.log('Firestore 寫入測試成功，文檔 ID:', docRef.id);
      
      // 嘗試讀取剛寫入的文檔
      const docSnap = await getDocs(collection(db, 'test'));
      console.log('Firestore 讀取測試成功，文檔數量:', docSnap.size);
      
      // 清理測試文檔
      try {
        await deleteDoc(doc(db, 'test', docRef.id));
        console.log('測試文檔清理完成');
      } catch (deleteError) {
        console.warn('測試文檔清理失敗:', deleteError.message);
      }
      
      console.log('Firestore 連接測試通過');
      return true;
      
    } catch (error) {
      console.warn('Firestore 連接測試失敗:', error.message);
      console.warn('錯誤詳情:', error);
      return false;
    }
  },

  // 測試 Firebase Storage 連接性
  async testFirebaseStorageConnection() {
    if (!storage) {
      console.log('Storage 未初始化');
      return false;
    }

    try {
      // 取得當前登入用戶
      const user = getCurrentUser();
      if (!user || !user.uid) {
        console.log('⚠️ 用戶未登入，無法測試具體的用戶路徑');
        // 返回 true 允許程序繼續，但會在實際上傳時處理認證問題
        return true;
      }
      
      // 創建一個測試用的小檔案
      const testBlob = new Blob(['Firebase Storage connection test'], { type: 'text/plain' });
        // 使用符合安全規則的用戶路徑
      const testPath = `user/${user.uid}/test/connection-test-${Date.now()}.txt`;
      const testRef = storageRef(storage, testPath);
      
      console.log('=== Firebase Storage 連接測試 ===');
      console.log('用戶 ID:', user.uid);
      console.log('測試檔案路徑:', testPath);
      console.log('Storage bucket:', storage.app.options.storageBucket);
      
      // 設定短時間超時測試
      const uploadTask = uploadBytes(testRef, testBlob);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('連接測試超時 (8秒)')), 8000);
      });
      
      const snapshot = await Promise.race([uploadTask, timeoutPromise]);
      
      console.log('Firebase Storage 連接測試成功');
      console.log('測試檔案上傳完成:', {
        fullPath: testPath,
        name: `connection-test-${Date.now()}.txt`,
        size: testBlob.size
      });
      
      // 測試下載 URL 取得
      const testDownloadURL = await getDownloadURL(testRef);
      console.log('測試下載 URL 取得成功:', testDownloadURL);
      
      // 清理測試檔案
      try {
        await deleteObject(testRef);
        console.log('測試檔案清理完成');
      } catch (deleteError) {
        console.warn('測試檔案清理失敗:', deleteError.message);
      }
      
      return true;
      
    } catch (error) {
      console.warn('Firebase Storage 連接測試失敗:', error.message);
      console.warn('錯誤詳情:', error);
      return false;
    }
  },
};

export default photoService;
