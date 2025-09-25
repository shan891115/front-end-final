const admin = require('firebase-admin');

// 從環境變數讀取配置，不要硬編碼
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// 驗證必要的環境變數
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN', 
  'FIREBASE_DATABASE_URL',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ 缺少以下環境變數:', missingVars);
  console.error('請檢查 .env 檔案是否正確設置');
  process.exit(1);
}

// 初始化 Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp(firebaseConfig);
    console.log('✅ Firebase Admin SDK 初始化成功');
  } catch (error) {
    console.error('❌ Firebase Admin SDK 初始化失敗:', error.message);
    process.exit(1);
  }
}

module.exports = {
  admin,
  db: admin.firestore(),
  auth: admin.auth()
};