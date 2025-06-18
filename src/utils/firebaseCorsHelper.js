// Firebase CORS 問題解決方案
// 暫時修復 Firebase Storage CORS 問題

// 1. 檢查 Firebase 專案設定
console.log('=== Firebase CORS 問題診斷 ===');

// 檢查環境變數
const envCheck = {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
};

console.log('環境變數檢查:', envCheck);
console.log('Storage Bucket 已設定:', !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);

// 2. CORS 解決方案

export const fixCorsIssues = {
  // 方案一：使用 Firebase Admin API（需要後端）
  useAdminAPI: false,
  
  // 方案二：設定 Firebase Storage CORS 規則
  corsRules: `
    [
      {
        "origin": ["http://localhost:5173", "http://localhost:3000", "https://your-domain.com"],
        "method": ["GET", "POST", "PUT", "DELETE"],
        "maxAgeSeconds": 3600
      }
    ]
  `,
  
  // 方案三：使用 gsutil 設定 CORS（需要 Google Cloud SDK）
  gcloudCommand: `
    # 安裝 Google Cloud SDK
    # 然後執行：
    gsutil cors set cors.json gs://final-compare.firebasestorage.app
  `,
  
  // 方案四：暫時使用本地儲存
  useLocalStorage: true
};

// 3. 臨時解決方案：增強本地儲存
export const enhancedLocalStorage = {
  // 使用 IndexedDB 代替 localStorage 來儲存大量照片資料
  useIndexedDB: true,
  
  // 壓縮圖片以減少儲存空間
  compressImages: true,
  
  // 自動同步到 Firebase（當 CORS 問題解決後）
  autoSync: true
};

// 4. 立即可用的解決方案
export const immediateFixOptions = {
  option1: {
    title: "使用 Firebase Emulator",
    description: "在本地運行 Firebase Emulator 避開 CORS 問題",
    command: "firebase emulators:start --only storage,firestore"
  },
  
  option2: {
    title: "修改開發伺服器設定",
    description: "在 vite.config.js 中加入代理設定",
    config: `
      export default {
        server: {
          proxy: {
            '/firebase': {
              target: 'https://firebasestorage.googleapis.com',
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/firebase/, '')
            }
          }
        }
      }
    `
  },
  
  option3: {
    title: "暫時停用 Firebase Storage",
    description: "使用本地 Base64 儲存，等 CORS 問題解決後再啟用",
    status: "已實作在 photoService.js 中"
  }
};

console.log('建議的解決方案:', immediateFixOptions);
