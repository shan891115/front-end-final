<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- 頁頭區域 - 使用#4caf50背景 -->
    <section class="flex justify-center py-16 bg-gradient-to-r from-[#66cdaa] to-[#3cb371] text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-light mb-6 tracking-tight pb-2">旅遊目的地比較</h2>
        <p class="text-xl font-light mb-4 opacity-90">使用AI智能分析工具比較不同旅遊目的地，做出最適合您的選擇</p>
      </div>
    </section>

    <section class="flex-grow flex justify-center py-10">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="compare-page">
          <div v-if="!isServiceHealthy" class="status-message error">
            <p><strong>服務狀態：</strong>無法連接到後端服務。請檢查服務器是否正在運行，或稍後再試。</p>
            <p>{{ errorMessage }}</p>
          </div>
          <div v-else class="status-message success">
            <p><strong>服務狀態：</strong>服務連接正常。</p>
          </div>

          <form @submit.prevent="compareDestinations" class="form-section">
            <h2>輸入旅遊網址進行比較</h2>
            <div v-for="(item, index) in travelUrls" :key="index" class="url-input-group">
              <div class="input-row">
                <input 
                  type="url" 
                  v-model="item.url" 
                  placeholder="例：https://www.example.com/travel-article" 
                  required 
                  class="url-input text-gray-700 placeholder-gray-400"
                >
                <input 
                  type="text" 
                  v-model="item.title" 
                  placeholder="網址標題 (可選)" 
                  class="title-input text-gray-700 placeholder-gray-400"
                >
                <button type="button" @click="removeUrlField(index)" v-if="travelUrls.length > 1" class="remove-btn">移除</button>
              </div>
            </div>
            <div class="form-actions">
              <button type="button" @click="addUrlField" class="add-btn">新增比較網址</button>
              <button type="submit" :disabled="isLoading || !isServiceHealthy || travelUrls.length < 2" class="compare-btn" @click="handleCompareClick">
                {{ isLoading && !comparisonResult ? '分析比較中...' : '開始比較' }}
              </button>
              <button type="button" @click="resetAll" :disabled="isLoading" class="reset-btn">全部重置</button>
            </div>
          </form>

          <div v-if="errorMessage && (isServiceHealthy || (!isServiceHealthy && !errorMessage.includes('無法連接')))" class="status-message error form-error">
            {{ errorMessage }}
          </div>

          <!-- 登入提示訊息 -->
          <div v-if="showLoginPrompt" class="mt-6 bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  請先登入以使用比較功能，將在5秒後跳轉至登入頁面...
                </p>
              </div>
            </div>
          </div>

          <div v-if="isLoading && !comparisonResult" class="loading-indicator">
            <p>請稍候，AI 正在努力為您分析比較...</p>
            <div class="spinner"></div>
          </div>

          <div v-if="parsedComparison && parsedComparison.comparison" class="results-section text-gray-700">
            <h2 class="text-xl font-bold mb-4">比較結果分析</h2>

            <div v-if="parsedComparison.comparison.recommendation" class="recommendation-box">
              <h3>AI 總體推薦</h3>
              <p>{{ parsedComparison.comparison.recommendation }}</p>
            </div>

            <div class="comparison-table-container">
              <table>
                <thead>
                  <tr>
                    <th>比較項目</th>
                    <th v-for="(dest, idx) in parsedComparison.comparison.destinations" :key="idx">
                      {{ dest.title || `目的地 ${idx + 1}` }}
                      <a :href="dest.url" target="_blank" v-if="dest.url" class="source-link">(原始連結)</a>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="parsedComparison.comparison.destinations && parsedComparison.comparison.destinations.length > 0">
                    <tr v-for="key in Object.keys(parsedComparison.comparison.destinations[0]).filter(k => !['title', 'url', 'raw_content'].includes(k))" :key="key">
                      <td><strong>{{ capitalize(typeof key === 'string' ? key.replace(/_/g, ' ') : key) }}</strong></td>
                      <td v-for="(dest, idx) in parsedComparison.comparison.destinations" :key="idx">
                        <ul v-if="Array.isArray(dest[key])">
                          <li v-for="(item, itemIdx) in dest[key]" :key="itemIdx">{{ item }}</li>
                        </ul>
                        <span v-else>{{ dest[key] }}</span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <div v-if="parsedComparison.comparison.summary" class="summary-box">
              <h3 class="text-lg font-bold mb-4 pb-2">各項總結</h3>
              <!-- 當 summary 是字符串時直接顯示 -->
              <p v-if="typeof parsedComparison.comparison.summary === 'string'">
                {{ parsedComparison.comparison.summary }}
              </p>
              <!-- 當 summary 是對象時使用列表顯示 -->
              <ul v-else>
                <li v-for="(value, key) in parsedComparison.comparison.summary" :key="key">
                  <strong>{{ capitalize(typeof key === 'string' ? key.replace(/_/g, ' ') : key) }}:</strong> {{ value }}
                </li>
              </ul>
            </div>

            <!-- 優缺點比較 -->
            <div v-if="parsedComparison.comparison.pros_cons" class="pros-cons-box">
              <h3 class="text-lg font-bold mb-4 pb-2">優缺點分析</h3>
              
              <!-- 表格形式的優缺點分析 -->
              <div class="pros-cons-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>目的地</th>
                      <th class="pros-column">優點</th>
                      <th class="cons-column">缺點</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(analysis, destKey) in parsedComparison.comparison.pros_cons" :key="destKey">
                      <td class="destination-name">
                        <strong>{{ destKey.includes('destination') ? `目的地 ${destKey.replace('destination', '')}` : destKey }}</strong>
                      </td>
                      <td class="pros-cell">
                        <ul>
                          <li v-for="(pro, idx) in analysis.pros" :key="idx">{{ pro }}</li>
                        </ul>
                      </td>
                      <td class="cons-cell">
                        <ul>
                          <li v-for="(con, idx) in analysis.cons" :key="idx">{{ con }}</li>
                        </ul>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- 保留原有的卡片式佈局但隱藏 -->
              <div v-if="false" class="pros-cons-grid">
                <div v-for="(analysis, destKey) in parsedComparison.comparison.pros_cons" :key="destKey" class="destination-pros-cons">
                  <h4>{{ destKey.includes('destination') ? `目的地 ${destKey.replace('destination', '')}` : destKey }}</h4>
                  <div class="pros-section">
                    <h5>優點：</h5>
                    <ul>
                      <li v-for="(pro, idx) in analysis.pros" :key="idx">{{ pro }}</li>
                    </ul>
                  </div>
                  <div class="cons-section">
                    <h5>缺點：</h5>
                    <ul>
                      <li v-for="(con, idx) in analysis.cons" :key="idx">{{ con }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="comparisonResult" class="chat-section">
            <h2 class="text-xl font-bold section-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 7v4" />
                <line x1="8" y1="16" x2="8" y2="16" />
                <line x1="16" y1="16" x2="16" y2="16" />
                <path d="M9 11v-4" />
                <path d="M15 11v-4" />
              </svg>
              與 AI 助理進一步提問
            </h2>
            <div class="chat-history" ref="chatHistoryContainer">              
              <div v-for="(chat, index) in chatHistory" :key="index" :class="['chat-message', chat.role]">
                <div v-if="chat.role === 'user'">
                  <p><strong>你:</strong> {{ chat.content }}</p>
                </div>
                <div v-else>
                  <p><strong>AI 助理:</strong></p>
                  <div class="message-content" v-html="formatMarkdown(chat.content)"></div>
                </div>
              </div>
            </div>
            <form @submit.prevent="sendMessage" class="chat-input-form">
              <input 
                type="text" 
                v-model="userPrompt" 
                placeholder="針對比較結果提問..." 
                :disabled="isLoading" 
                class="chat-input text-gray-700 placeholder-gray-400"
              >
              <button type="submit" :disabled="isLoading || !userPrompt.trim()" class="send-btn">
                {{ isLoading && userPrompt ? '傳送中...' : '傳送' }}
              </button>
            </form>
          </div>

          <!-- 在表單下方添加最近比較列表 -->
          <div v-if="recentComparisons.length > 0" class="recent-comparisons">
            <h3 class="text-lg font-bold section-title">
              <svg xmlns="http://www.w3.org/2000/svg" class="section-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              最近的比較
            </h3>
            <div class="comparison-list">
              <div v-for="comp in recentComparisons" :key="comp.id" class="comparison-item">
                <div class="comparison-info">
                  <span class="comparison-date">{{ new Date(comp.timestamp).toLocaleString() }}</span>
                  <span class="comparison-title">
                    {{ comp.data.analysis?.comparison?.destinations?.map(d => d.title).join(' vs ') || '比較結果' }}
                  </span>
                </div>
                <div class="comparison-actions">
                  <button @click="loadComparisonById(comp.id)" class="load-btn">載入</button>
                  <button @click="deleteComparison(comp.id)" class="delete-btn">刪除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import aiService from '../services/aiService';
import { storageService } from '../services/storageService';
import { isAuthenticated } from '../services/authService';
import { useRouter } from 'vue-router';

const router = useRouter();

// 響應式變數
const travelUrls = ref([{ url: '', title: '' }]);
const isLoading = ref(false);
const comparisonResult = ref(null);
const userPrompt = ref('');
const chatHistory = ref([]);
const errorMessage = ref('');
const isServiceHealthy = ref(true);
const chatHistoryContainer = ref(null);
const recentComparisons = ref([]);
const showLoginPrompt = ref(false);

// 組件掛載時檢查服務狀態
onMounted(async () => {
  isServiceHealthy.value = await aiService.healthCheck();
  if (!isServiceHealthy.value) {
    errorMessage.value = '無法連接到後端服務，請檢查服務器狀態。';
  }
  
  // 載入最近的比較結果
  recentComparisons.value = storageService.getComparisons();
  
  // 檢查 URL 參數是否有比較 ID
  const urlParams = new URLSearchParams(window.location.search);
  const comparisonId = urlParams.get('id');
  if (comparisonId) {
    loadComparisonById(comparisonId);
  }
});

// 解析 AI 回應
const parsedComparison = computed(() => {
  if (!comparisonResult.value) return null;
  
  try {
    let analysisData = comparisonResult.value.analysis;
    
    if (!analysisData && comparisonResult.value.data) {
      analysisData = comparisonResult.value.data.analysis;
    }
    
    if (!analysisData) return null;
    
    // 處理字符串格式的 JSON
    if (typeof analysisData === 'string') {
      // 清理 Markdown 代碼塊標記
      let cleanJson = analysisData;
      if (cleanJson.includes('```json')) {
        cleanJson = cleanJson.replace(/```json\n|\n```/g, '');
      } else if (cleanJson.includes('```')) {
        cleanJson = cleanJson.replace(/```\n|\n```/g, '');
      }
      
      try {
        const parsed = JSON.parse(cleanJson);
        
        // 檢查解析後的結構是否符合預期
        if (parsed.comparison) {
          return { comparison: parsed.comparison };
        } else if (parsed.destinations) {
          return { comparison: parsed };
        } else {
          console.log('解析後的 JSON 結構:', parsed);
          return { comparison: parsed };
        }
      } catch (jsonError) {
        console.error('JSON 解析錯誤:', jsonError, '原始數據:', cleanJson);
        throw new Error('JSON 格式無效');
      }
    }
    
    // 處理對象格式的 JSON
    if (typeof analysisData === 'object') {
      if (analysisData.comparison) {
        return { comparison: analysisData.comparison };
      } else if (analysisData.destinations) {
        return { comparison: analysisData };
      }
    }
    
    console.error('無法識別的分析數據格式:', analysisData);
    return null;
  } catch (error) {
    console.error('解析比較結果失敗:', error);
    errorMessage.value = `比較結果格式有誤，無法解析: ${error.message}`;
    return null;
  }
});

// 添加網址欄位
const addUrlField = () => {
  if (travelUrls.value.length < 5) { // Limit to 5 URLs for example
    travelUrls.value.push({ url: '', title: '' });
  } else {
    errorMessage.value = '最多只能比較 5 個網址。';
  }
};

// 刪除網址欄位
const removeUrlField = (index) => {
  if (travelUrls.value.length > 1) {
    travelUrls.value.splice(index, 1);
  }
};

// 驗證 URL 格式
const isValidUrl = (url) => {
  try {
    new URL(url);
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
  } catch {
    return false;
  }
};

// 處理比較按鈕點擊
const handleCompareClick = (event) => {
  if (!isAuthenticated.value) {
    event.preventDefault();
    showLoginPrompt.value = true;
    setTimeout(() => {
      router.push('/login?redirect=/compare');
    }, 5000);
  }
};

// 比較旅遊景點
const compareDestinations = async () => {
  errorMessage.value = '';
  const validUrls = travelUrls.value.filter(item => item.url.trim());
  
  if (validUrls.length < 2) {
    errorMessage.value = '請至少添加兩個有效的旅遊網址進行比較。';
    return;
  }
  
  const invalidFormatUrls = validUrls.filter(item => !isValidUrl(item.url.trim()));
  if (invalidFormatUrls.length > 0) {
    errorMessage.value = `部分網址格式不正確: ${invalidFormatUrls.map(u => u.url).join(', ')}。請檢查後再試。`;
    return;
  }
  
  if (!isServiceHealthy.value) {
    errorMessage.value = '後端服務暫時不可用，請稍後再試。';
    return;
  }
  
  isLoading.value = true;
  comparisonResult.value = null;
  chatHistory.value = [];
  
  try {
    const destinationsToCompare = validUrls.map(item => ({
      url: item.url.trim(),
      title: item.title.trim() || '' // Use title if provided
    }));
    
    const response = await aiService.compareDestinations(destinationsToCompare);
    
    if (response.success && response.data) {
      comparisonResult.value = response.data;
      
      // 儲存比較結果到 localStorage
      const savedId = storageService.saveComparison(response.data);
      
      // 更新最近的比較結果列表
      recentComparisons.value = storageService.getComparisons();
      
      // 更新 URL 以便分享（可選）
      if (savedId) {
        const url = new URL(window.location);
        url.searchParams.set('id', savedId);
        window.history.pushState({}, '', url);
      }
      
      chatHistory.value = [{
        role: 'ai',
        content: '我已完成對您提供的旅遊目的地分析，請查看上方比較表格。如果您有任何問題或需要更多建議，請隨時提問！'
      }];
      
      if (response.data.scrapeDetails && response.data.scrapeDetails.failed > 0) {
        const failedUrlsInfo = response.data.scrapeDetails.failedUrls
          .map(f => `${f.url} (原因: ${f.error || '未知'})`)
          .join('; ');
        errorMessage.value = `注意：部分網址抓取失敗：${failedUrlsInfo}。比較結果可能不完整。`;
      }
    } else {
      throw new Error(response.error || '比較請求失敗，未收到有效數據。');
    }
    
  } catch (error) {
    console.error('比較請求失敗:', error);
    errorMessage.value = `比較失敗：${error.message}`;
    if (error.message && error.message.toLowerCase().includes('fetch')) {
        isServiceHealthy.value = await aiService.healthCheck(); // Re-check health
        if(!isServiceHealthy.value) errorMessage.value = '網絡連接失敗或後端服務無響應，請檢查網絡設置或稍後再試。';
    }
  } finally {
    isLoading.value = false;
  }
};

// 發送聊天訊息
const sendMessage = async () => {
  if (!userPrompt.value.trim()) return;
  
  const userMessage = userPrompt.value.trim();
  chatHistory.value.push({ role: 'user', content: userMessage });
  userPrompt.value = '';
  isLoading.value = true;
  
  try {
    // 提取比較結果數據作為聊天上下文
    let context = null;
    if (comparisonResult.value && typeof comparisonResult.value === 'object') {
      // 檢查是否已經是解析過的 JSON
      if (comparisonResult.value.destinations || comparisonResult.value.summary) {
        context = comparisonResult.value;
      } else if (comparisonResult.value.analysis) {
        // 嘗試解析 analysis 字段
        try {
          const parsedAnalysis = JSON.parse(comparisonResult.value.analysis);
          context = parsedAnalysis;
        } catch (e) {
          console.warn('無法解析比較結果作為 JSON:', e);
          context = { summary: comparisonResult.value.analysis };
        }
      }
    }
    
    const response = await aiService.sendChatMessage(
      userMessage, 
      chatHistory.value.slice(0, -1), 
      context
    );
    
    if (response && response.success && response.message) {
      chatHistory.value.push({
        role: 'ai',
        content: response.message
      });
    } else {
      throw new Error(response?.error || '無法獲取有效的 AI 回應');
    }
    
  } catch (error) {
    console.error('聊天請求失敗:', error);
    chatHistory.value.push({
      role: 'ai',
      content: `抱歉，處理您的請求時發生錯誤：${error.message || '未知錯誤'}。請稍後再試。`
    });
  } finally {
    isLoading.value = false;
  }
};

// 清除所有數據
const resetAll = () => {
  travelUrls.value = [{ url: '', title: '' }];
  comparisonResult.value = null;
  chatHistory.value = [];
  errorMessage.value = '';
  userPrompt.value = '';
  // isServiceHealthy.value = true; // Don't reset health status, re-check if needed
  onMounted(); // Re-check health status
};

// 聊天視窗滾動到底部
watch(chatHistory, async () => {
  await nextTick();
  if (chatHistoryContainer.value) {
    chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight;
  }
}, { deep: true });

// Filter for capitalizing words
const capitalize = (value) => {
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// 添加載入比較結果的函數
const loadComparisonById = (id) => {
  const savedComparison = storageService.getComparisonById(id);
  if (savedComparison) {
    // 先確保清空當前結果
    comparisonResult.value = null;
    
    // 延遲一下再設置新值，避免Vue渲染問題
    setTimeout(() => {
      comparisonResult.value = savedComparison.data;
      // 更新URL以便分享
      const url = new URL(window.location);
      url.searchParams.set('id', id);
      window.history.pushState({}, '', url);
      // 重置聊天歷史
      chatHistory.value = [{
        role: 'ai',
        content: '我已載入之前的比較結果，請查看上方比較表格。如果您有任何問題或需要更多建議，請隨時提問！'
      }];
    }, 100);
  } else {
    errorMessage.value = '無法載入比較結果，可能已被刪除或過期。';
  }
};

// 添加刪除比較的函數
const deleteComparison = (id) => {
  if (confirm('確定要刪除這個比較結果嗎？')) {
    storageService.deleteComparison(id);
    recentComparisons.value = storageService.getComparisons();
    
    // 如果刪除的是當前顯示的比較，清空顯示
    if (window.location.search.includes(`id=${id}`)) {
      comparisonResult.value = null;
      chatHistory.value = [];
      // 清除 URL 參數
      const url = new URL(window.location);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url);
    }
  }
};

// Markdown 格式化函數
const formatMarkdown = (text) => {
  if (!text) return '';
  
  try {
    // 檢查是否為 Markdown 格式
    const hasMarkdown = text.includes('**') || 
                      text.includes('##') || 
                      text.includes('*   ') ||
                      text.includes('- ') ||
                      text.includes('---');
    
    if (hasMarkdown) {
      // 處理 Markdown 格式
      let formatted = text;
      
      // 處理標題
      formatted = formatted.replace(/## (.*?)(\n|$)/g, '<h2 class="text-xl font-bold my-3">$1</h2>');
      formatted = formatted.replace(/### (.*?)(\n|$)/g, '<h3 class="text-lg font-bold my-2">$1</h3>');
      
      // 處理粗體 - 使用非貪婪模式以確保正確匹配嵌套的粗體文本
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // 處理斜體 - 但避免與列表項衝突
      formatted = formatted.replace(/(?<!\*)\*((?!\s)[^*]+?)\*(?!\*)/g, '<em>$1</em>');
      
      // 創建無序列表容器
      if (formatted.includes('* ') || formatted.includes('- ')) {
        // 首先將單獨的列表項包裝起來
        formatted = formatted.replace(/(\n|^)([\*\-]\s+.*?)(\n(?![\*\-]\s+)|\s*$)/g, '$1<ul>$2</ul>$3');
      }
      
      // 處理列表項
      formatted = formatted.replace(/\* (.*?)(\n|$)/g, '<li class="ml-4 mb-1">$1</li>');
      formatted = formatted.replace(/- (.*?)(\n|$)/g, '<li class="ml-4 mb-1">$1</li>');
      
      // 處理分隔線
      formatted = formatted.replace(/---/g, '<hr class="my-4 border-t border-gray-300">');
      
      // 處理換行
      formatted = formatted.replace(/\n\n/g, '<p class="my-3"></p>');
      formatted = formatted.replace(/\n/g, '<br>');
      
      return formatted;
    } else {
      // 使用原來的處理方法，但添加更好的換行處理
      return text.replace(/\n\n/g, '<p class="my-3"></p>').replace(/\n/g, '<br>');
    }
  } catch (error) {
    console.error('Markdown formatting error:', error);
    return text; // 返回原始文本作為後備
  }
};

</script>

<script>
// This script block is for non-setup logic, like named exports
export const usageExample = `
// 1. 環境變數設置 (.env)
VUE_APP_API_URL=http://localhost:3000/api
FIRECRAWL_API_KEY=fc-your-api-key-here
OPENAI_API_KEY=sk-your-openai-key-here

// 2. 啟動後端服務
node server.js

// 3. 測試 API 端點
curl -X POST http://localhost:3000/api/comparison/compare \\
  -H "Content-Type: application/json" \\
  -d '{
    "urls": [
      {"url": "https://example.com/tokyo-travel", "title": "東京旅遊"},
      {"url": "https://example.com/osaka-travel", "title": "大阪旅遊"}
    ]
  }'

// 4. 前端使用
import aiService from './services/aiService'; // Adjust path if necessary

const destinations = [
  { url: 'https://example.com/destination1', title: '目的地1' },
  { url: 'https://example.com/destination2', title: '目的地2' }
];

async function testComparison() {
  try {
    const result = await aiService.compareDestinations(destinations);
    console.log('Comparison Result:', result);
  } catch (error) {
    console.error('Error during comparison test:', error);
  }
}

testComparison();
`;
</script>

<style scoped>
.compare-page {
  margin: 0 auto;
  padding: 0;
}

.status-message {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 6px;
  font-size: 0.95em;
}
.status-message.success {
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}
.status-message.error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #c62828;
}
.status-message p {
  margin: 0;
  margin-bottom: 5px;
}
.status-message p:last-child {
  margin-bottom: 0;
}
.form-error {
  font-weight: bold;
}

.form-section {
  background-color: #fff;
  padding: 20px;
  margin-bottom: 40px;
  border-radius: 6px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}
.form-section h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #2e7d32;
  font-size: 1.5em;
}
.url-input-group {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}
.url-input-group:last-child {
  border-bottom: none;
}
.input-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.url-input, .title-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
  font-size: 0.95em;
}
.url-input {
  flex: 3;
}
.title-input {
  flex: 1;
}
.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}
button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95em;
  transition: background-color 0.2s ease;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.add-btn {
  background-color: #4caf50;
  color: white;
}
.add-btn:hover:not(:disabled) {
  background-color: #43a047;
}
.compare-btn {
  background-color: #4caf50;
  color: white;
}
.compare-btn:hover:not(:disabled) {
  background-color: #43a047;
}
.reset-btn {
  background-color: #f5f5f5;
  color: #333;
}
.reset-btn:hover:not(:disabled) {
  background-color: #e0e0e0;
}
.remove-btn {
  background-color: #ffcdd2;
  color: #c62828;
  padding: 5px 10px;
  font-size: 0.9em;
  white-space: nowrap;
  margin-left: 5px;
  min-width: 60px;
}
.remove-btn:hover:not(:disabled) {
  background-color: #ef9a9a;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #4caf50;
}
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #4caf50;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-top: 20px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.recommendation-box, .summary-box {
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 0 10px 10px 0;
}
.recommendation-box p, .summary-box ul {
  margin: 0;
}
.summary-box ul {
  list-style-type: none;
  padding-left: 0;
}
.summary-box li {
  margin-bottom: 5px;
}

/* 優缺點分析樣式 */
.pros-cons-box {
  margin-bottom: 20px;
}
.pros-cons-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.destination-pros-cons {
  flex: 1;
  min-width: 300px;
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.destination-pros-cons h4 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}
.pros-section, .cons-section {
  margin-bottom: 10px;
}
.pros-section h5 {
  color: #2e7d32;
  margin-bottom: 5px;
}
.cons-section h5 {
  color: #c62828;
  margin-bottom: 5px;
}
.pros-section ul, .cons-section ul {
  margin-top: 0;
  padding-left: 20px;
}
.pros-section li {
  color: #2e7d32;
}
.cons-section li {
  color: #c62828;
}

/* 優缺點表格樣式 */
.pros-cons-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  padding: 1px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background-color: white;
}
.pros-cons-table-container table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: none;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}
.pros-cons-table-container th, 
.pros-cons-table-container td {
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  padding: 12px;
  text-align: left;
  vertical-align: top;
}

.pros-cons-table-container tr:last-child td {
  border-bottom: none;
}

.pros-cons-table-container th:last-child,
.pros-cons-table-container td:last-child {
  border-right: none;
}
.pros-cons-table-container th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #333;
}
.pros-cons-table-container .pros-column {
  background-color: #e8f5e9;
  color: #2e7d32;
}
.pros-cons-table-container .cons-column {
  background-color: #ffebee;
  color: #c62828;
}
.pros-cons-table-container .destination-name {
  width: 20%;
  background-color: #f5f5f5;
}
.pros-cons-table-container .pros-cell,
.pros-cons-table-container .cons-cell {
  width: 40%;
}
.pros-cons-table-container .pros-cell ul {
  padding-left: 20px;
  margin: 0;
}
.pros-cons-table-container .cons-cell ul {
  padding-left: 20px;
  margin: 0;
}
.pros-cons-table-container .pros-cell li {
  color: #2e7d32;
  margin-bottom: 5px;
}
.pros-cons-table-container .cons-cell li {
  color: #c62828;
  margin-bottom: 5px;
}

.results-section h2, .chat-section h2, .recent-comparisons h3 {
  color: #2e7d32;
  margin-top: 10px;
  margin-bottom: 20px;
}

.chat-section {
  background-color: #fff;
  padding: 20px;
  margin-top: 30px;
  margin-bottom: 20px;
  border-radius: 6px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}

.chat-history {
  border: 1px solid #e0e0e0;
  padding: 15px;
  margin-bottom: 15px;
  max-height: 350px;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 4px;
}
.chat-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.6;
}
.chat-message.user {
  background-color: #e8f5e9;
  text-align: right;
  margin-left: auto;
  max-width: 75%;
}
.chat-message.user p { 
  margin-bottom: 6px; 
  text-align: left; /* 確保文本左對齊 */
}
.chat-message.ai {
  background-color: #f1f8e9;
  text-align: left;
  margin-right: auto;
  max-width: 75%;
}
.chat-message.ai p { margin-bottom: 6px; }
.chat-message strong {
  font-weight: bold;
  color: #2e7d32; /* User */
  display: inline; /* 改為行內顯示，讓文本在同一行 */
  margin-right: 4px; /* 用戶名稱後的間距 */
}
.chat-message.ai strong {
  color: #558b2f; /* AI */
  display: block; /* AI 名稱單獨顯示在一行 */
  margin-bottom: 8px;
}
.message-content {
  text-align: left;
  line-height: 1.6;
}
.message-content h2 {
  margin: 12px 0 8px 0;
  font-size: 1.2rem;
  font-weight: bold;
}
.message-content h3 {
  margin: 10px 0 6px 0;
  font-size: 1.1rem;
  font-weight: bold;
}
.message-content p {
  margin-bottom: 10px;
}
.message-content ul, .message-content ol {
  margin-left: 16px;
  margin-bottom: 12px;
  margin-top: 8px;
  padding-left: 4px;
}
.message-content li {
  margin-bottom: 6px;
  list-style-type: disc;
}
.message-content strong {
  font-weight: bold;
  color: inherit; /* 保持粗體文本顏色與正文一致 */
  display: inline;
}
.message-content br {
  line-height: 1.8;
}

.chat-input-form {
  display: flex;
  gap: 10px;
}
.chat-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95em;
}
.send-btn { 
  background-color: #4caf50; 
  color: white; 
}
.send-btn:hover:not(:disabled) { 
  background-color: #43a047; 
}

.recent-comparisons {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.05);
}
.comparison-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.comparison-item {
  flex: 1;
  min-width: 300px;
  background-color: #f5f5f5;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.comparison-info {
  margin-bottom: 10px;
}
.comparison-date {
  font-size: 0.8em;
  color: #666;
}
.comparison-title {
  font-weight: bold;
  color: #333;
}
.comparison-actions {
  display: flex;
  gap: 10px;
}
.load-btn, .delete-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95em;
  transition: background-color 0.2s ease;
}
.load-btn { background-color: #4caf50; color: white; }
.load-btn:hover:not(:disabled) { background-color: #43a047; }
.delete-btn { background-color: #ef9a9a; color: white; }
.delete-btn:hover:not(:disabled) { background-color: #e57373; }

/* 比較表格樣式 */
.comparison-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  padding: 1px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background-color: white;
}
.comparison-table-container table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: none;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}
.comparison-table-container th, 
.comparison-table-container td {
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  padding: 12px;
  text-align: left;
}

.comparison-table-container tr:last-child td {
  border-bottom: none;
}

.comparison-table-container th:last-child,
.comparison-table-container td:last-child {
  border-right: none;
}
.comparison-table-container th {
  background-color: #f5f5f5;
  font-weight: bold;
  color: #333;
}
.comparison-table-container tr:nth-child(even) {
  background-color: #f9f9f9;
}
.source-link {
  font-size: 0.8em;
  margin-left: 5px;
  color: #4caf50;
  text-decoration: none;
}
.source-link:hover {
  text-decoration: underline;
}

/* 圖標樣式 */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-icon {
  flex-shrink: 0;
  margin-right: 4px;
}
</style>