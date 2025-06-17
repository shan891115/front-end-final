// 身份驗證服務
import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';

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

// 檢查環境變數是否存在
console.log('Firebase 配置檢查:');
console.log('API_KEY 存在:', !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log('AUTH_DOMAIN 存在:', !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('DATABASE_URL 存在:', !!import.meta.env.VITE_FIREBASE_DATABASE_URL);
console.log('PROJECT_ID 存在:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('STORAGE_BUCKET 存在:', !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
console.log('MESSAGING_SENDER_ID 存在:', !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log('APP_ID 存在:', !!import.meta.env.VITE_FIREBASE_APP_ID);

// 身份驗證狀態
const currentUser = ref(null);
const isAuthenticated = ref(false);

// API 基礎 URL (用於後端 API 調用)
const API_BASE_URL = '/api';

// 使用 localStorage 來存儲用戶令牌和信息
const TOKEN_KEY = 'auth_token';
const USER_INFO_KEY = 'user_info';

// 初始化Firebase
let auth = null;
try {
  if (!firebaseConfig) {
    throw new Error('Firebase配置未定義');
  }
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  console.log('Firebase 初始化成功');
} catch (error) {
  console.error('Firebase 初始化失敗:', error.message);
}

// 監聽身份驗證狀態變化
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // 用戶已登入
      console.log('用戶已登入:', user.email);
      
      currentUser.value = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
      isAuthenticated.value = true;
      
      // 將用戶信息存儲到 localStorage
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(currentUser.value));
      user.getIdToken().then(token => {
        localStorage.setItem(TOKEN_KEY, token);
      });
    } else {
      // 用戶已登出
      console.log('用戶未登入');
      
      currentUser.value = null;
      isAuthenticated.value = false;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_INFO_KEY);
    }
  });
}

// 註冊新用戶
export const registerUser = async (email, password) => {
  if (!auth) {
    console.error('Firebase Auth 未初始化');
    return { user: null, error: 'Firebase Auth 未初始化' };
  }
  
  try {
    console.log('嘗試註冊用戶:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("註冊成功！使用者 UID:", user.uid);
    
    return { 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, 
      error: null 
    };
  } catch (error) {
    console.error("註冊失敗:", error.code, error.message);
    
    let errorMessage = '註冊失敗';
    
    // 處理常見錯誤
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = '這個電子郵件地址已經被註冊過了';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = '無效的電子郵件地址';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = '密碼強度不足';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = '電子郵件/密碼註冊未啟用';
    } else if (error.code === 'auth/invalid-api-key') {
      errorMessage = 'API Key 無效';
    }
    
    return { user: null, error: errorMessage };
  }
};

// 用戶登入
export const loginUser = async (email, password) => {
  if (!auth) {
    console.error('Firebase Auth 未初始化');
    return { user: null, error: 'Firebase Auth 未初始化' };
  }
  
  try {
    console.log('嘗試登入用戶:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("登入成功！使用者 UID:", user.uid);
    
    return { 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, 
      error: null 
    };
  } catch (error) {
    console.error("登入失敗:", error.code, error.message);
    
    let errorMessage = '登入失敗';
    
    // 處理常見錯誤
    if (error.code === 'auth/user-not-found') {
      errorMessage = '找不到該用戶';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = '密碼錯誤';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = '無效的電子郵件地址';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = '該用戶已被停用';
    } else if (error.code === 'auth/invalid-api-key') {
      errorMessage = 'API Key 無效';
    }
    
    return { user: null, error: errorMessage };
  }
};

// 用戶登出
export const logoutUser = async () => {
  if (!auth) {
    console.error('Firebase Auth 未初始化');
    return { success: false, error: 'Firebase Auth 未初始化' };
  }
  
  try {
    console.log('嘗試登出用戶');
    
    await signOut(auth);
    console.log('登出成功');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("登出失敗:", error.code, error.message);
    return { success: false, error: error.message };
  }
};

// 獲取當前用戶
export const getCurrentUser = () => {
  return currentUser.value;
};

// 檢查用戶是否已登入
export const isUserLoggedIn = () => {
  return isAuthenticated.value;
};

// 獲取身份驗證令牌
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// 導出身份驗證狀態的響應式引用
export { currentUser, isAuthenticated, auth };