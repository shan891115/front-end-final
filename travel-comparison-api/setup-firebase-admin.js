/**
 * Firebase Admin SDK 驗證設置助手
 * 
 * 這個腳本幫助您設置 Firebase Admin SDK 的身份驗證
 * 它會生成必要的服務帳號檔案，使您的應用能夠存取 Firebase Realtime Database
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 創建一個 readline 介面來讀取用戶輸入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 檢查服務帳號目錄是否存在，不存在則創建
const credentialsPath = path.join(__dirname, 'src', 'firebase', 'credentials');
if (!fs.existsSync(credentialsPath)) {
  fs.mkdirSync(credentialsPath, { recursive: true });
  console.log(`✅ 已創建目錄: ${credentialsPath}`);
}

// 服務帳號文件路徑
const serviceAccountPath = path.join(credentialsPath, 'service-account.json');

// 檢查是否已經存在服務帳號文件
if (fs.existsSync(serviceAccountPath)) {
  console.log('⚠️ 檢測到現有的服務帳號文件。');
  rl.question('是否要覆蓋現有文件? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      setupServiceAccount();
    } else {
      console.log('操作已取消。');
      rl.close();
    }
  });
} else {
  setupServiceAccount();
}

/**
 * 設置服務帳號
 */
function setupServiceAccount() {
  console.log('\n===== Firebase Admin SDK 服務帳號設置 =====\n');
  console.log('請從 Firebase 控制台獲取服務帳號資訊:');
  console.log('1. 登入 Firebase 控制台: https://console.firebase.google.com/');
  console.log('2. 選擇您的專案: final-compare');
  console.log('3. 點擊左側導航欄的 ⚙️ (設定) 圖標');
  console.log('4. 選擇「專案設定」');
  console.log('5. 切換到「服務帳號」標籤');
  console.log('6. 點擊「產生新的私鑰」按鈕');
  console.log('7. 下載 JSON 檔案並複製裡面的內容\n');

  rl.question('請將從 Firebase 控制台下載的服務帳號 JSON 內容貼在這裡 (貼完後按 Enter): ', (jsonContent) => {
    try {
      // 嘗試解析 JSON
      const serviceAccount = JSON.parse(jsonContent);
      
      // 驗證服務帳號 JSON 格式
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error('服務帳號 JSON 格式不正確，缺少必要字段。');
      }
      
      // 寫入服務帳號文件
      fs.writeFileSync(serviceAccountPath, JSON.stringify(serviceAccount, null, 2));
      console.log(`✅ 服務帳號文件已保存到: ${serviceAccountPath}`);
      
      // 更新 .env 檔案
      updateEnvFile(serviceAccount);
      
      rl.close();
    } catch (error) {
      console.error('❌ 錯誤:', error.message);
      console.log('請確保複製的是有效的 JSON 內容。');
      rl.question('要重試嗎? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y') {
          setupServiceAccount();
        } else {
          console.log('操作已取消。');
          rl.close();
        }
      });
    }
  });
}

/**
 * 更新 .env 檔案
 */
function updateEnvFile(serviceAccount) {
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  // 如果 .env 文件存在，讀取它的內容
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // 準備要添加的 Firebase 配置
  const firebaseConfig = [
    '# Firebase Admin SDK 配置',
    `FIREBASE_PROJECT_ID=${serviceAccount.project_id}`,
    `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`,
    `FIREBASE_DATABASE_URL=https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app/`,
    // 私鑰需要特殊處理，因為包含換行符
    `FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\\n/g, '\\\\n')}"`
  ];
  
  // 檢查 .env 文件中是否已包含這些配置
  let updated = false;
  const newEnvContent = envContent.split('\n').filter(line => {
    // 過濾掉已存在的 Firebase 配置行
    return !line.startsWith('FIREBASE_PROJECT_ID=') && 
           !line.startsWith('FIREBASE_CLIENT_EMAIL=') &&
           !line.startsWith('FIREBASE_DATABASE_URL=') &&
           !line.startsWith('FIREBASE_PRIVATE_KEY=');
  }).join('\n');
  
  // 將新的配置添加到 .env 文件
  const updatedEnvContent = `${newEnvContent}\n\n${firebaseConfig.join('\n')}\n`;
  fs.writeFileSync(envPath, updatedEnvContent);
  
  console.log('✅ 已更新 .env 檔案，添加了 Firebase Admin SDK 配置。');
  
  // 顯示下一步說明
  console.log('\n===== 設置完成! =====');
  console.log('請執行以下命令重啟您的伺服器:');
  console.log('npm run start');
}
