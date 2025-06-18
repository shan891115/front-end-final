// 環境變數檢查工具
export function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_DATABASE_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  console.log('🔍 環境變數檢查報告:');
  console.log('==========================================');
  
  const missing = [];
  const present = [];
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value) {
      present.push(varName);
      // 只顯示前3個字符，其餘用星號隱藏，更安全
      const maskedValue = value.length > 3 ? 
        `${value.substring(0, 3)}${'*'.repeat(Math.min(value.length - 6, 10))}${value.slice(-3)}` : 
        '***';
      console.log(`✅ ${varName}: ${maskedValue}`);
    } else {
      missing.push(varName);
      console.error(`❌ ${varName}: 未設置`);
    }
  });

  console.log('==========================================');
  console.log(`✅ 已設置: ${present.length}/${requiredEnvVars.length}`);
  console.log(`❌ 缺失: ${missing.length}/${requiredEnvVars.length}`);
  
  if (missing.length > 0) {
    console.error('缺失的環境變數:', missing);
    return false;
  }
  
  console.log('🎉 所有環境變數都已正確設置！');
  return true;
}

// 在開發模式下自動檢查
if (import.meta.env.DEV) {
  checkEnvironmentVariables();
}
