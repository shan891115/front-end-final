const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const firebaseService = require('../services/firebaseService');

// 為所有 AI 路由添加 CORS 中間件
router.use((req, res, next) => {
  // 允許的來源列表 - 包含生產環境和本地開發環境
  const allowedOrigins = [
    'https://front-end-final-tawny.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// 從行程內容提取必要資訊的輔助函數
function extractInfoFromItinerary(content) {
  if (!content) return {};
  
  const result = {
    country: null,
    days: null,
    region: null,
    type: null
  };
  
  try {
    // 嘗試從標題或首行提取國家名稱
    const titleMatch = content.match(/(?:^|\n)#\s*([^#\n]+?)(?:\d+|\s*日|\s*天)(?:旅遊|之旅|行程|遊記|深度|遊|攻略)/i);
    if (titleMatch && titleMatch[1]) {
      let countryName = titleMatch[1].trim();
      // 清理文本中可能有的特殊符號
      countryName = countryName.replace(/[【】\[\]「」『』（）()]/g, '');
      result.country = countryName;
    }
    
    // 嘗試尋找國家提及
    if (!result.country) {
      const commonCountries = [
        '日本', '韓國', '泰國', '台灣', '新加坡', '馬來西亞', '越南', 
        '印尼', '菲律賓', '中國', '香港', '澳門', '印度', '美國', '加拿大', 
        '墨西哥', '英國', '法國', '德國', '義大利', '西班牙', '葡萄牙', 
        '瑞士', '荷蘭', '比利時', '奧地利', '希臘', '澳洲', '紐西蘭'
      ];
      
      for (const country of commonCountries) {
        if (content.includes(country)) {
          result.country = country;
          break;
        }
      }
    }
    
    // 提取天數
    const daysMatch = content.match(/(\d+)\s*(?:日|天)(?:旅遊|之旅|行程|遊記)/i) || 
                     content.match(/(?:為期|共)(\d+)\s*(?:日|天)/i) || 
                     content.match(/(?:^|\n)#[^#]*?(\d+)\s*(?:日|天)/i);
    
    if (daysMatch) {
      result.days = daysMatch[1];
    } else if (content.match(/第1天|第一天/i)) {
      // 如果發現有"第一天"但找不到總天數，假設至少是1天
      result.days = '1';
    }
    
    // 嘗試判斷地區
    const regionPatterns = {
      'asia': /亞洲|東亞|東南亞|南亞/i,
      'europe': /歐洲|西歐|東歐|南歐|北歐/i,
      'america': /美洲|北美|南美|拉丁美洲/i,
      'oceania': /大洋洲|澳洲/i,
      'africa': /非洲/i
    };
    
    for (const [region, pattern] of Object.entries(regionPatterns)) {
      if (pattern.test(content)) {
        result.region = region;
        break;
      }
    }
    
    // 尋找旅遊類型
    const typePatterns = {
      'family': /家庭旅遊|親子|家人|帶小孩/i,
      'honeymoon': /蜜月|情侶|浪漫/i,
      'adventure': /冒險|探險|極限|挑戰|登山|潛水/i,
      'culture': /文化|歷史|古蹟|藝術|節慶/i,
      'food': /美食|餐廳|料理|小吃|飲食/i
    };
    
    for (const [type, pattern] of Object.entries(typePatterns)) {
      if (pattern.test(content)) {
        result.type = type;
        break;
      }
    }
    
    console.log('[後端] 從行程中提取的資訊:', result);
    return result;
    
  } catch (error) {
    console.warn('從行程提取資訊時發生錯誤:', error);
    return result;
  }
}

router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: '訊息內容不能為空'
      });
    }
    
    console.log('收到聊天請求:', { message, hasContext: !!context });
    
    const response = await aiService.chatWithAI(message, context);
    
    console.log('AI 聊天回應:', response);
    
    res.json({
      success: true,
      message: response
    });
    
  } catch (error) {
    console.error('AI 聊天錯誤:', error);
    res.status(500).json({
      error: '無法處理 AI 請求',
      message: error.message
    });
  }
});

// 新增行程建議路由
router.post('/itinerary', async (req, res) => {
  try {
    const { region, country, days, departureDate, travelType, specialRequirements } = req.body;
    
    // 輸入驗證
    const validation = validateItineraryRequest({ country, days, departureDate });
    if (!validation.isValid) {
      return res.status(400).json({
        error: '輸入驗證失敗',
        details: validation.errors
      });
    }
    
    console.log('收到行程建議請求:', { 
      region, 
      country, 
      days, 
      travelType, 
      hasSpecialRequirements: !!specialRequirements 
    });
    
    // 構建優化的AI提示詞
    const prompt = buildItineraryPrompt({
      region,
      country,
      days,
      departureDate,
      travelType,
      specialRequirements
    });
    
    // 調用AI服務生成回應
    let aiResponse = await generateItineraryWithRetry(prompt);
    console.log('AI 行程建議已生成，回應長度:', aiResponse.length);
    
    // 解析天數範圍 - 需要在使用 targetDays 之前定義
    const daysRange = parseDaysRange(days);
    let minDays = daysRange.min;
    let maxDays = daysRange.max || daysRange.min;
    let targetDays = daysRange.target;
    
    // 檢查特別需求中是否有調整天數的請求，並相應調整目標天數
    if (specialRequirements && specialRequirements.trim()) {
      const requirements = specialRequirements.trim();
      
      // 檢測減1天的請求
      if (requirements.includes('減1天') || requirements.includes('減一天')) {
        targetDays = Math.max(1, targetDays - 1);
        console.log(`檢測到減1天請求，調整目標天數為: ${targetDays}天`);
      }
      // 檢測加1天的請求
      else if (requirements.includes('加1天') || requirements.includes('加一天')) {
        targetDays = targetDays + 1;
        console.log(`檢測到加1天請求，調整目標天數為: ${targetDays}天`);
      }
    }
    
    // 處理和驗證AI回應 - 避免過度處理
    let processedResponse = processAIResponse(aiResponse);
    
    // 如果初始回應看起來合理，就先不要過度處理
    const initialDaysCount = (processedResponse.content.match(/# 第\d+天/g) || []).length;
    const hasBasicStructure = processedResponse.content.includes('## 行程') || 
                             processedResponse.content.includes('## 用餐推薦') || 
                             processedResponse.content.includes('## 住宿推薦');
    
    console.log(`初始AI回應分析: 天數=${initialDaysCount}, 目標=${targetDays}, 有基本結構=${hasBasicStructure}`);
    
    // 更寬鬆但合理的初始回應評估標準
    const initiallyGood = (initialDaysCount === targetDays && hasBasicStructure) || 
                         (initialDaysCount >= targetDays - 1 && hasBasicStructure && targetDays <= 5); // 只有短期行程才允許差1天
    
    if (initiallyGood) {
      console.log('初始AI回應質量良好，減少後續調整');
    }
    
    // 使用新的分層驗證邏輯檢查生成的內容
    let currentContent = processedResponse.content;
    
    // 執行完整驗證 - 使用目標天數作為主要驗證標準
    let contentValidation = validateItineraryContent(currentContent, targetDays, targetDays);
    let actualDays = contentValidation.actualDays;
    
    console.log(`檢查行程天數: 請求=${days}天 (範圍${minDays}-${maxDays}天, 目標=${targetDays}天), 實際生成=${actualDays}天`);
    console.log(`內容驗證結果: 大標題=${contentValidation.headerValid ? '有效' : '無效'}, 中標題=${contentValidation.subheadersValid ? '完整' : '缺失'}, 內容=${contentValidation.contentValid ? '完整' : '有問題'}`);
    
    if (contentValidation.errors.length > 0) {
      console.log('內容驗證錯誤:', contentValidation.errors.slice(0, 5), contentValidation.errors.length > 5 ? `...還有${contentValidation.errors.length - 5}個問題` : '');
      
      // 分析問題分佈
      const dayProblems = contentValidation.dayDetails.filter(day => !day.subheadersValid || !day.contentValid);
      if (dayProblems.length > 0) {
        console.log('問題分佈在以下天數:', dayProblems.map(day => `第${day.dayNum}天`).join(', '));
      }
    }
    
    // 處理天數不足或超出目標的情況
    let continuationAttempts = 0;
    const MAX_CONTINUATION_ATTEMPTS = 3; // 增加到3次，確保能達到目標天數
    let needsAdjustment = !contentValidation.isValid || actualDays !== targetDays;
    
    // 對於明顯天數不足的情況，必須進行調整
    const significantShortfall = actualDays < Math.ceil(targetDays * 0.75); // 少於75%的天數就算嚴重不足
    if (significantShortfall) {
      needsAdjustment = true;
      console.log(`天數嚴重不足（${actualDays}/${targetDays}），強制進行調整`);
    } else if (initiallyGood && actualDays === targetDays) {
      // 只有在天數完全匹配時才跳過調整
      needsAdjustment = false;
      console.log('初始回應質量良好且天數完全匹配，跳過調整');
    }
    
    while (needsAdjustment && continuationAttempts < MAX_CONTINUATION_ATTEMPTS) {
      continuationAttempts++;
      
      // 分析內容問題類型
      const needsMoreDays = actualDays < targetDays;
      const needsFewerDays = actualDays > targetDays;
      const hasIncompleteHeaders = !contentValidation.headerValid;
      const hasIncompleteSubheaders = !contentValidation.subheadersValid;
      const hasContentProblems = !contentValidation.contentValid;
      
      // 記錄問題類型
      console.log(`嘗試調整行程 (${continuationAttempts + 1}/${MAX_CONTINUATION_ATTEMPTS}): `, {
        needsMoreDays,
        needsFewerDays,
        hasIncompleteHeaders,
        hasIncompleteSubheaders,
        hasContentProblems,
        actualDays,
        targetDays
      });
      
      // 構建調整的提示詞
      let adjustmentPrompt = '';
      
      if (needsFewerDays) {
        console.log(`天數超過目標，需要減少至${targetDays}天 (目前有${actualDays}天)`);
        
        // 如果天數超過目標，直接截斷到目標天數
        const dayBlocks = currentContent.split(/(?=^# 第\d+天)/gm);
        if (dayBlocks.length > targetDays) {
          // 只保留前targetDays天，但確保第一個block不是空的
          const validBlocks = dayBlocks.filter(block => block.trim().length > 0);
          if (validBlocks.length > targetDays) {
            currentContent = validBlocks.slice(0, targetDays).join('').trim();
          }
          actualDays = targetDays;
          
          // 重新驗證調整後的內容
          contentValidation = validateItineraryContent(currentContent, targetDays, targetDays);
          actualDays = contentValidation.actualDays;
          
          console.log(`已截斷至${targetDays}天，重新驗證結果: 實際天數=${actualDays}`);
          
          // 如果截斷後驗證通過，跳出迴圈
          if (contentValidation.isValid && actualDays === targetDays) {
            needsAdjustment = false;
            break;
          }
        }
      } else if (needsMoreDays) {
        console.log(`天數不足，嘗試生成更多天數 (已有${actualDays}天，目標${targetDays}天)`);
        
        // 提取已有行程的風格特徵
        const styleFeatures = extractStyleFeatures(currentContent);
        
        // 構建生成更多天數的提示詞
        adjustmentPrompt = `以下是一個關於${country}的${days}天旅遊行程，但目前只完成了${actualDays}天，需要補充到${targetDays}天。\n\n`;
        adjustmentPrompt += `現有行程總結：這是一個${country}的${targetDays}天行程規劃，已完成了第1天到第${actualDays}天，現在需要生成第${actualDays + 1}天到第${targetDays}天的內容。\n\n`;
        
        // 使用更簡潔的上下文
        const contextLines = currentContent.split('\n').slice(-10).join('\n');
        adjustmentPrompt += `已有行程的最後部分：\n${contextLines}\n\n`;
        
        // 明確指示要生成的天數
        const missingDays = [];
        for (let i = actualDays + 1; i <= targetDays; i++) {
          missingDays.push(i);
        }
        
        adjustmentPrompt += `請按順序生成以下天數的完整行程：第${missingDays.join('天、第')}天\n\n`;
        adjustmentPrompt += `重要：必須嚴格按照以下格式，為每一天生成完整內容：\n\n`;
        adjustmentPrompt += `# 第X天 (地點名稱)\n\n`;
        adjustmentPrompt += `## 行程\n* 上午: 詳細活動描述（請將所有景點名稱用粗體標記，例如**景點名稱**）\n* 下午: 詳細活動描述（請將所有景點名稱用粗體標記，例如**景點名稱**）\n* 傍晚: 詳細活動描述（請將所有景點名稱用粗體標記，例如**景點名稱**）\n\n`;
        adjustmentPrompt += `## 用餐推薦\n* 早餐: 餐廳名稱和特色美食\n* 午餐: 餐廳名稱和特色美食\n* 晚餐: 餐廳名稱和特色美食\n\n`;
        adjustmentPrompt += `## 住宿推薦\n* 酒店/民宿名稱，位置描述，價格範圍，設施特點\n\n`;
        adjustmentPrompt += `## 小建議\n實用旅行建議，如穿著、交通、文化注意事項等\n\n`;
        
        adjustmentPrompt += `極其重要：
1. 請確保生成準確的${targetDays - actualDays}天完整行程，使總天數達到${targetDays}天
2. 保持與前面完全一致的格式、風格和詳細程度
3. ⚠️⚠️ 所有景點名稱必須用粗體標記，例如**景點名稱**，這對系統識別景點非常重要！`;
        
      } else if (hasIncompleteSubheaders || hasContentProblems) {
        console.log(`行程格式或內容有問題，嘗試修復`);
        
        // 找出需要修復的天數
        const problematicDays = contentValidation.dayDetails
          .filter(day => !day.subheadersValid || !day.contentValid)
          .map(day => day.dayNum);
        
        // 構建修復特定天數的提示詞
        adjustmentPrompt = `以下是一個關於${country}的${days}天旅遊行程（目標${targetDays}天），但有些部分需要修復：\n\n`;
        
        // 具體列出每天的問題
        contentValidation.dayDetails.forEach(day => {
          if (!day.subheadersValid || !day.contentValid) {
            adjustmentPrompt += `第${day.dayNum}天的問題：\n`;
            
            if (!day.subheadersValid) {
              adjustmentPrompt += `- 缺少中標題: ${day.missingSubheaders.join(', ')}\n`;
            }
            
            if (!day.contentValid) {
              adjustmentPrompt += `- 內容問題: ${day.contentIssues.join(', ')}\n`;
            }
          }
        });
        
        // 添加原始內容，但只包含需要修復的天數
        adjustmentPrompt += `\n原始內容：\n\n`;
        
        let dayBlocks = extractDayBlocks(currentContent);
        problematicDays.forEach(dayNum => {
          const dayBlock = dayBlocks.find(block => block.dayNum === dayNum);
          if (dayBlock) {
            adjustmentPrompt += dayBlock.content + '\n\n';
          }
        });
        
        adjustmentPrompt += `\n請根據上述問題，提供完整修復後的第${problematicDays.join('天, 第')}天內容，按照原格式修復缺失的部分。修復後的內容應該包含以下結構：\n\n`;
        adjustmentPrompt += `# 第X天 (地點名稱)\n\n`;
        adjustmentPrompt += `## 行程\n* 上午: 詳細活動描述（請將所有景點名稱用粗體標記，例如**景點名稱**）\n* 下午: 詳細活動描述（請將所有景點名稱用粗體標記，例如**景點名稱**）\n* 傍晚: 詳細活動描述（請將所有景點名稱用粗體標記，例如**景點名稱**）\n\n`;
        adjustmentPrompt += `## 用餐推薦\n* 早餐: 餐廳名稱和特色美食\n* 午餐: 餐廳名稱和特色美食\n* 晚餐: 餐廳名稱和特色美食\n\n`;
        adjustmentPrompt += `## 住宿推薦\n* 酒店/民宿名稱，位置描述，價格範圍，設施特點\n\n`;
        adjustmentPrompt += `## 小建議\n實用旅行建議，如穿著、交通、文化注意事項等\n`;
        
        adjustmentPrompt += `\n重要要求：
1. 只需要提供完整修復後的這${problematicDays.length}天內容，不要修改或提供其他天數的內容
2. ⚠️ 所有景點名稱必須用粗體標記，例如**景點名稱**`;
      }
      
      // 只有在需要AI協助時才調用
      if (adjustmentPrompt) {
        // 提取行程風格特徵並加入提示詞
        const styleFeatures = extractStyleFeatures(currentContent);
        if (styleFeatures.detailLevel) {
          adjustmentPrompt += `\n\n請保持與原行程相同的詳細程度：${styleFeatures.detailLevel}`;
        }
        if (styleFeatures.specialFocus) {
          adjustmentPrompt += `\n重點關注：${styleFeatures.specialFocus}`;
        }
        
        // 調用AI服務進行調整
        const adjustmentResponse = await generateItineraryWithRetry(adjustmentPrompt, 2);
        console.log(`調整回應 #${continuationAttempts}, 長度:`, adjustmentResponse.length);
        
        // 處理調整後的回應
        let processedAdjustmentResponse = processAIResponse(adjustmentResponse);
        let adjustmentContent = processedAdjustmentResponse.content;
        
        // 如果調整後的內容以標題開頭，且原內容不以換行結尾，則添加換行
        if (
          (adjustmentContent.trim().startsWith('#') || 
          adjustmentContent.trim().startsWith('*') || 
          adjustmentContent.trim().startsWith('-')) && 
          !currentContent.endsWith('\n\n')
        ) {
          adjustmentContent = '\n\n' + adjustmentContent;
        }
        
        console.log("AI 調整回應長度:", adjustmentContent.length);
        
        // 使用安全的內容合併邏輯，避免過度處理
        if (needsMoreDays) {
          // 對於天數不足的情況，優先保留原始內容並追加新內容
          currentContent = safeMergeContent(currentContent, adjustmentContent, targetDays);
        } else {
          // 對於格式修復，仍使用智能合併
          currentContent = smartMergeContent(currentContent, adjustmentContent, actualDays, targetDays, contentValidation);
        }
      }
      
      // 重新進行內容驗證
      contentValidation = validateItineraryContent(currentContent, targetDays, targetDays);
      actualDays = contentValidation.actualDays;
      
      console.log(`調整後行程天數: ${actualDays}天 (目標: ${targetDays}天)`);
      console.log(`內容完整性檢查: ${contentValidation.isValid ? '完整' : '不完整'}`);
      
      // 檢查是否仍需調整 - 優先考慮天數是否達到目標
      const previousNeedsAdjustment = needsAdjustment;
      
      // 如果天數已經達到目標，即使格式有小問題也不再調整
      if (actualDays >= targetDays) {
        needsAdjustment = false;
        console.log(`天數已達到目標（${actualDays}/${targetDays}），停止調整`);
      } else if (actualDays < Math.ceil(targetDays * 0.75)) {
        // 如果天數嚴重不足，繼續調整
        needsAdjustment = true;
        console.log(`天數嚴重不足（${actualDays}/${targetDays}），繼續調整`);
      } else {
        // 對於天數不足但不是嚴重不足的情況，仍需調整
        needsAdjustment = actualDays < targetDays || !contentValidation.isValid;
        console.log(`天數不足或內容有問題（${actualDays}/${targetDays}），需要調整: ${needsAdjustment}`);
      }
      
      // 如果狀態沒有改善，記錄更多詳細資訊
      if (previousNeedsAdjustment && needsAdjustment) {
        console.log('調整嘗試未完全解決問題:');
        console.log('驗證結果:', {
          headerValid: contentValidation.headerValid,
          subheadersValid: contentValidation.subheadersValid,
          contentValid: contentValidation.contentValid,
          errorCount: contentValidation.errors.length,
          actualDays,
          targetDays
        });
        
        if (contentValidation.errors.length > 0) {
          console.log('剩餘問題:', contentValidation.errors.slice(0, 3), '...');
        }
      }
    }

    // 檢查缺漏並AI補齊 - 使用目標天數作為標準 (可選步驟)
    try {
      currentContent = await aiSmartPatch(currentContent, targetDays);
    } catch (patchError) {
      console.warn('AI補齊步驟失敗，繼續使用現有內容:', patchError.message);
      // 不中斷流程，繼續使用現有的內容
    }

    // 最終處理
    processedResponse.content = currentContent;
    
    // 記錄失敗分析，以便將來改進
    const logFailureStats = (reason) => {
      const dayGenStats = {
        requestedDays: targetDays,
        actualDays: actualDays,
        daysShortfall: targetDays - actualDays,
        initialResponseLength: aiResponse.length,
        finalContentLength: currentContent.length,
        continuationAttempts: continuationAttempts,
        contentComplete: finalValidation.isComplete,
        missingContentCount: Array.isArray(finalValidation.missingInfo) ? finalValidation.missingInfo.length : 0,
        truncatedDays: Array.isArray(finalValidation.truncatedDays) ? finalValidation.truncatedDays : [],
        failureReason: reason,
        timestamp: new Date().toISOString(),
        country: country,
        requestType: travelType || 'general',
      };
      console.log('行程生成統計:', JSON.stringify(dayGenStats));
      
      // 這裡可以添加將統計信息保存到數據庫或日誌文件的代碼
    };
    
    // 使用新的分層驗證結果評估行程
    const finalValidation = validateItineraryContent(processedResponse.content, targetDays, targetDays);
    
    // 檢查不同類型的問題
    const hasDayShortfall = finalValidation.actualDays < targetDays;
    const hasDayExcess = finalValidation.actualDays > targetDays;
    const hasHeaderIssues = !finalValidation.headerValid;
    const hasSubheaderIssues = !finalValidation.subheadersValid;
    const hasContentIssues = !finalValidation.contentValid;
    
    if (hasDayShortfall || hasDayExcess || hasHeaderIssues || hasSubheaderIssues || hasContentIssues) {
      // 判斷主要問題類型
      let primaryIssue = hasDayShortfall ? '天數不足' : 
                        hasDayExcess ? '天數超出' :
                        hasHeaderIssues ? '標題格式問題' : 
                        hasSubheaderIssues ? '中標題不完整' : '內容缺失';
      
      // 記錄失敗統計
      logFailureStats(primaryIssue);
      
      // 添加警告信息
      let warningMsg = '';
      
      if (hasDayShortfall) {
        warningMsg = `無法生成完整的${targetDays}天行程，僅生成了${finalValidation.actualDays}天。`;
        
        if (targetDays > 10) {
          warningMsg += `由於行程天數較多，建議考慮將行程分為兩部分查詢，例如先查詢前${Math.ceil(targetDays/2)}天，再查詢後${Math.floor(targetDays/2)}天。`;
        } else {
          warningMsg += `請嘗試重新生成或調整天數范圍。您也可以點擊「修改建議」來添加剩餘天數的特定需求。`;
        }
      } else if (hasDayExcess) {
        warningMsg = `生成了${finalValidation.actualDays}天行程，超出目標${targetDays}天。已自動調整內容。`;
      } 
      else {
        // 找出有問題的天數
        const problemDays = finalValidation.dayDetails
          .filter(day => !day.subheadersValid || !day.contentValid)
          .map(day => day.dayNum)
          .sort((a, b) => a - b);
          
        if (problemDays.length > 0) {
          warningMsg = `行程第${problemDays.join(', ')}天的內容可能不完整。`;
          
          // 提供更具體的問題描述
          if (hasSubheaderIssues) {
            const missingSubheaderDays = finalValidation.dayDetails
              .filter(day => day.missingSubheaders && day.missingSubheaders.length > 0)
              .map(day => `第${day.dayNum}天缺少${day.missingSubheaders.join('、')}`)
              .slice(0, 2);
              
            if (missingSubheaderDays.length > 0) {
              warningMsg += ` (例如: ${missingSubheaderDays.join('; ')})`;
            }
          }
          else if (hasContentIssues) {
            warningMsg += ` 部分內容可能不夠詳細或格式不符合要求。`;
          }
          
          warningMsg += ` 您可以點擊「修改建議」來補充這些部分，或重新生成行程。`;
        } else {
          warningMsg = `行程內容可能存在格式問題。您可以點擊「修改建議」來調整。`;
        }
      }
      
      processedResponse.warning = (processedResponse.warning || '') + warningMsg;
    }
    
    // 添加內容完整性檢查結果到回應中
    processedResponse.contentCompleteness = {
      isComplete: contentValidation.isComplete,
      missingInfo: contentValidation.missingInfo,
      truncatedDays: contentValidation.truncatedDays
    };
    
    return res.json({
      success: true,
      data: {
        itinerary: processedResponse.content,
        metadata: {
          country,
          days: parseInt(targetDays), // 使用目標天數
          requestedRange: days, // 保留原始請求的天數範圍
          targetDays: parseInt(targetDays), // 明確標示目標天數
          generatedAt: new Date().toISOString(),
          travelType: travelType || 'general',
          actualDays: finalValidation.actualDays,
          validation: {
            isValid: finalValidation.isValid,
            headerValid: finalValidation.headerValid,
            subheadersValid: finalValidation.subheadersValid,
            contentValid: finalValidation.contentValid,
            errorCount: finalValidation.errors.length
          },
          dayDetails: finalValidation.dayDetails.map(day => ({
            dayNum: day.dayNum,
            isComplete: day.subheadersValid && day.contentValid,
            missingSubheaders: day.missingSubheaders || [],
            contentIssues: day.contentIssues || []
          }))
        }
      },
      ...(processedResponse.warning && { warning: processedResponse.warning }),
      ...(finalValidation.errors.length > 0 && { validationIssues: finalValidation.errors.slice(0, 5) })
    });
    
  } catch (error) {
    console.error('行程建議路由錯誤:', error);
    
    // 根據錯誤類型返回不同的回應
    if (error.name === 'AIServiceError') {
      return res.status(503).json({
        error: 'AI服務暫時無法使用',
        message: '請稍後再試',
        code: 'AI_SERVICE_UNAVAILABLE'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: '請求參數無效',
        message: error.message,
        code: 'INVALID_REQUEST'
      });
    }
    
    return res.status(500).json({
      error: '服務器內部錯誤',
      message: '無法處理行程建議請求',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 輸入驗證函數
function validateItineraryRequest({ country, days, departureDate }) {
  const errors = [];
  
  if (!country || typeof country !== 'string' || country.trim().length === 0) {
    errors.push('國家名稱不能為空');
  }
  
  if (!days || isNaN(parseInt(days)) || parseInt(days) < 1 || parseInt(days) > 30) {
    errors.push('天數必須是1-30之間的數字');
  }
  
  if (departureDate) {
    const date = new Date(departureDate);
    const today = new Date();
    if (isNaN(date.getTime()) || date < today) {
      errors.push('出發日期格式無效或已過期');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 構建AI提示詞
function buildItineraryPrompt({ region, country, days, departureDate, travelType, specialRequirements }) {
  // 確保 days 一定是字串
  if (typeof days === 'number') {
    days = days.toString();
  }
  
  const travelTypeMap = {
    'family': '家庭旅遊',
    'honeymoon': '蜜月旅行',
    'adventure': '冒險旅遊',
    'culture': '文化體驗',
    'food': '美食之旅'
  };
  
  // 解析天數範圍並計算目標天數
  let minDays = 1;
  let maxDays = 1;
  let targetDays = 1;
  
  if (days.includes('-')) {
    const parts = days.split('-');
    minDays = parseInt(parts[0], 10);
    maxDays = parseInt(parts[1], 10);
    targetDays = Math.round((minDays + maxDays) / 2);
  } else if (days.endsWith('+')) {
    minDays = parseInt(days.replace('+', ''), 10);
    maxDays = minDays + 2;
    targetDays = Math.round((minDays + maxDays) / 2);
  } else {
    minDays = maxDays = targetDays = parseInt(days, 10);
  }
  
  // 檢查特別需求中是否有調整天數的請求
  if (specialRequirements && specialRequirements.trim()) {
    const requirements = specialRequirements.trim();
    
    // 檢測減1天的請求
    if (requirements.includes('減1天') || requirements.includes('減一天')) {
      targetDays = Math.max(1, targetDays - 1);
      console.log(`檢測到減1天請求，調整目標天數為: ${targetDays}天`);
    }
    // 檢測加1天的請求
    else if (requirements.includes('加1天') || requirements.includes('加一天')) {
      targetDays = targetDays + 1;
      console.log(`檢測到加1天請求，調整目標天數為: ${targetDays}天`);
    }
  }
  
  let prompt = `請為我規劃一個${country}的${targetDays}天旅遊行程。`;
  
  if (region) {
    prompt += ` 主要遊覽${region}地區。`;
  }
  
  if (departureDate) {
    const date = new Date(departureDate);
    const formattedDate = date.toLocaleDateString('zh-TW');
    prompt += ` 出發日期為${formattedDate}。`;
  }
  
  if (travelType && travelTypeMap[travelType]) {
    prompt += ` 這是一次${travelTypeMap[travelType]}。`;
  }
  
  if (specialRequirements && specialRequirements.trim()) {
    prompt += `\n\n特別需求：${specialRequirements.trim()}`;
  }
  
  // 格式要求 - 使用目標天數作為生成標準
  prompt += `\n\n請嚴格按照以下Markdown格式為每一天（從第1天到第${targetDays}天）提供完整行程，必須生成準確的${targetDays}天：

# 第1天 (地點名稱)

## 行程
* 上午: 詳細活動描述，包含景點名稱和交通方式（請將所有景點名稱用粗體標記，例如**景點名稱**）
* 下午: 詳細活動描述，包含景點名稱和交通方式（請將所有景點名稱用粗體標記，例如**景點名稱**）
* 傍晚: 詳細活動描述，包含景點名稱和活動（請將所有景點名稱用粗體標記，例如**景點名稱**）

## 用餐推薦
* 早餐: 餐廳名稱和特色美食
* 午餐: 餐廳名稱和特色美食
* 晚餐: 餐廳名稱和特色美食

## 住宿推薦
* 酒店/民宿名稱，位置描述，價格範圍，設施特點

## 小建議
實用旅行建議，如穿著、交通、文化注意事項等

# 第2天 (地點名稱)

## 行程
* 上午: 詳細活動描述，包含景點名稱和交通方式（請將所有景點名稱用粗體標記，例如**景點名稱**）
* 下午: 詳細活動描述，包含景點名稱和交通方式（請將所有景點名稱用粗體標記，例如**景點名稱**）
* 傍晚: 詳細活動描述，包含景點名稱和活動（請將所有景點名稱用粗體標記，例如**景點名稱**）

## 用餐推薦
* 早餐: 餐廳名稱和特色美食
* 午餐: 餐廳名稱和特色美食
* 晚餐: 餐廳名稱和特色美食

## 住宿推薦
* 酒店/民宿名稱，位置描述，價格範圍，設施特點

## 小建議
實用旅行建議，如穿著、交通、文化注意事項等

極其重要的格式說明（請嚴格遵循）：
1. 你必須生成準確的${targetDays}天完整行程，這是必須達到的目標天數
2. 每天的內容必須包含以下所有四個中標題，並確保每個中標題下都有足夠的內容：
   a. ## 行程（必須有這個標題）
   b. ## 用餐推薦（必須有這個標題）
   c. ## 住宿推薦（必須有這個標題）
   d. ## 小建議（必須有這個標題）
3. 標題格式必須嚴格按照上面的範例：大標題用「# 第X天 (地點名稱)」，中標題用「## 行程」等
4. 中標題必須單獨成行，不能與其他內容合併在一行
5. 每個標題後必須空一行，再開始內容
6. 禁止省略任何中標題，即使內容相似也要完整列出
7. 所有天數的格式必須一致且完整，包含所有標題和內容
8. 禁止生成「# 第X天（待續）」或不完整的天數內容
9. 請從第1天開始，依序提供到第${targetDays}天的行程，不要遺漏任何一天
10. ⚠️⚠️ 極其重要的格式要求 ⚠️⚠️：請將所有景點名稱用Markdown粗體標記，例如**自由女神像**，**羅浮宮**，**艾菲爾鐵塔**，這個要求適用於每一天的每個時段，絕對不能遺漏！
11. 重要提醒：必須生成${targetDays}天行程，少於${targetDays}天或多於${targetDays}天都不符合要求

⚠️ 關鍵提醒：在整個${targetDays}天的行程中，每當提到任何景點、博物館、教堂、公園、廣場、建築物等旅遊景點名稱時，都必須用**景點名稱**的格式加粗標記！這對系統識別景點非常重要！

注意：用戶要求的天數範圍是${minDays}-${maxDays}天，但請以${targetDays}天為準確目標進行規劃。如果你生成的天數不足${targetDays}天，系統會要求你補充；如果超過${targetDays}天，系統會自動截斷多餘的天數。`;
  
  return prompt;
}

// 帶重試機制的AI服務調用
async function generateItineraryWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await aiService.chatWithAI(prompt);
      
      if (!response || response.trim().length === 0) {
        throw new Error('AI回應為空');
      }
      
      return response;
      
    } catch (error) {
      console.error(`AI服務調用失敗 (嘗試 ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt === maxRetries) {
        const aiError = new Error('AI服務連續失敗');
        aiError.name = 'AIServiceError';
        throw aiError;
      }
      
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// 處理AI回應
function processAIResponse(response) {
  const MAX_RESPONSE_SIZE = 12000; // 增加最大回應大小
  let processedContent = response.trim();
  let warning = null;
  
  // 移除AI回復中的非重點開頭語句（如禮貌性回應、確認語句等）
  processedContent = removeNonEssentialIntros(processedContent);
  
  // 檢查是否有不完整的標題行 (例如 "第4天 (")，並移除這些不完整的行
  const lines = processedContent.split('\n');
  const cleanedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i].trim();
    
    // 檢查不完整的標題行 (開頭有 # 但沒有完整結束)
    if ((currentLine.startsWith('# 第') || currentLine.startsWith('## 第')) && (
        currentLine.endsWith('(') || 
        currentLine.endsWith('-') || 
        currentLine.endsWith('（') ||
        currentLine.endsWith('，') ||
        currentLine.endsWith('：') ||
        currentLine.endsWith(':') ||
        /第\d+天\s*[(\（][^)\）]*$/.test(currentLine) || // 標題開始了一個括號但沒有閉合
        /第\d+天\s*$/.test(currentLine) ||              // 只有 "第X天" 沒有後續內容
        /第[一二三四五六七八九十]+天\s*[(\（][^)\）]*$/.test(currentLine) // 中文數字格式的不完整標題
    )) {
      console.log('發現不完整標題行:', currentLine);
      // 跳過這一行，不添加到清理後的內容中
      continue;
    }
    
    // 檢查更複雜的情況：標題被截斷在實際地點名稱中間
    if ((currentLine.startsWith('# 第') || currentLine.startsWith('## 第')) && 
        currentLine.includes('(') && !currentLine.includes(')') && 
        currentLine.length < 20) {
      console.log('發現標題中地點名被截斷的情況:', currentLine);
      continue;
    }
    
    // 檢查標題中融合了子標題的問題 (如 "第1天 (巴黎) - ## 行程:")
    if ((currentLine.startsWith('# 第') || currentLine.startsWith('## 第')) && 
        /[-–]\s*##\s+/.test(currentLine)) {
      console.log('發現標題與子標題混合的情況:', currentLine);
      // 分離標題和子標題
      const mainTitleMatch = currentLine.match(/^(#+ 第\d+天(?:\s*\([^)]*\))?)(?:\s*[-–]\s*)(##\s+.*)/);
      if (mainTitleMatch) {
        cleanedLines.push(mainTitleMatch[1]);
        cleanedLines.push(mainTitleMatch[2]);
        continue;
      }
    }
    
    cleanedLines.push(lines[i]);
  }
  
  processedContent = cleanedLines.join('\n');
  
  // 檢查回應大小
  if (processedContent.length > MAX_RESPONSE_SIZE) {
    // 嘗試在合適的位置截斷（找到最後一個完整的天數段落）
    const lastDayMatch = processedContent.substring(0, MAX_RESPONSE_SIZE).lastIndexOf('# 第');
    
    if (lastDayMatch > 0) {
      processedContent = processedContent.substring(0, lastDayMatch).trim();
      warning = '回應內容過長，已截斷部分內容。建議減少旅遊天數或分批查詢。';
    } else {
      processedContent = processedContent.substring(0, MAX_RESPONSE_SIZE);
      warning = '回應內容已截斷，請考慮減少旅遊天數。';
    }
    
    console.warn(`AI回應超過最大大小，已智能截斷`);
  }
  
  // 基本格式驗證 - 修復驗證邏輯
  const hasValidDayHeaders = processedContent.includes('# 第');
  const hasSubheaders = processedContent.includes('## 行程') || processedContent.includes('## 用餐推薦') || 
                       processedContent.includes('## 住宿推薦') || processedContent.includes('## 小建議');
  
  if (!hasValidDayHeaders) {
    console.warn('AI回應缺少天數標題');
  }
  if (!hasSubheaders) {
    console.warn('AI回應缺少中標題');
  }
   // 檢查是否有實際內容
  const contentLines = processedContent.split('\n').filter(line => line.trim().length > 0);
  if (contentLines.length < 5) {
    console.warn('AI回應內容過少，可能存在問題');
  }

  // 自動修正景點粗體標記
  processedContent = autoFixAttractionBolding(processedContent);

  return {
    content: processedContent,
    warning
  };
}

// 自動修正景點粗體標記的函數
function autoFixAttractionBolding(content) {
  if (!content) return content;
  
  // 常見景點關鍵詞和類型
  const attractionKeywords = [
    // 建築類
    '塔', '樓', '宮', '城', '堡', '廟', '寺', '教堂', '大教堂', '聖堂', '修道院',
    '博物館', '美術館', '紀念館', '展覽館', '文化館', '藝術中心',
    
    // 自然景觀
    '公園', '花園', '植物園', '動物園', '海灘', '湖', '山', '瀑布', '溫泉',
    '國家公園', '自然保護區', '風景區',
    
    // 地標和廣場
    '廣場', '街', '大道', '步行街', '商店街', '市場', '夜市', '碼頭', '港口',
    '橋', '大橋', '觀景台', '天文台', '塔台',
    
    // 娛樂場所
    '樂園', '主題公園', '遊樂園', '水族館', '科學館', '天文館', '劇院', '歌劇院',
    '音樂廳', '體育館', '競技場', '賽馬場'
  ];
  
  // 專有名詞前綴（通常景點名稱會包含這些）
  const prefixes = [
    '東京', '大阪', '京都', '富士山', '清水', '金閣', '銀閣', '淺草', '明治',
    '新宿', '澀谷', '原宿', '六本木', '台場', '築地', '上野', '秋葉原',
    '巴黎', '羅浮', '艾菲爾', '聖母院', '凱旋門', '香榭麗舍', '塞納河',
    '倫敦', '大英', '白金漢', '泰晤士河', '威斯敏斯特', '倫敦眼', '塔橋',
    '紐約', '自由女神', '中央公園', '時代廣場', '帝國大廈', '布魯克林',
    '韓國', '首爾', '景福', '昌德', '明洞', '弘大', '江南', '濟州',
    '泰國', '曼谷', '大皇宮', '玉佛寺', '考山路', '暹羅', '清邁', '普吉',
    '台灣', '台北', '故宮', '中正紀念堂', '淡水', '九份', '太魯閣', '阿里山',
    '北海道', '沖繩', '奈良', '神戶', '廣島', '鎌倉', '日光', '箱根'
  ];
  
  // 常見完整景點名稱
  const fullAttractionNames = [
    // 日本
    '東京鐵塔', '晴空塔', '淺草寺', '明治神宮', '皇居', '銀座', '築地市場', '上野公園',
    '清水寺', '金閣寺', '銀閣寺', '伏見稻荷大社', '嵐山', '奈良公園', '東大寺',
    '大阪城', '道頓堀', '心齋橋', '環球影城', '富士山',
    
    // 法國  
    '艾菲爾鐵塔', '羅浮宮', '聖母院', '凱旋門', '香榭麗舍大道', '塞納河', '凡爾賽宮',
    '聖心堂', '蒙馬特', '拉丁區', '瑪黑區',
    
    // 英國
    '大英博物館', '倫敦眼', '大本鐘', '白金漢宮', '塔橋', '泰晤士河', '威斯敏斯特教堂',
    '牛津街', '攝政街', '柯芬園', '海德公園',
    
    // 美國
    '自由女神像', '中央公園', '時代廣場', '帝國大廈', '布魯克林大橋', '華爾街',
    '第五大道', '百老匯', '洛克斐勒中心',
    
    // 韓國
    '景福宮', '昌德宮', '明洞', '弘大', '江南', '首爾塔', '漢江', '梨花女子大學',
    
    // 泰國
    '大皇宮', '玉佛寺', '臥佛寺', '鄭王廟', '考山路', '暹羅廣場', '水上市場',
    
    // 台灣
    '故宮博物院', '中正紀念堂', '台北101', '淡水老街', '九份老街', '太魯閣國家公園',
    '阿里山', '日月潭', '墾丁國家公園'
  ];
  
  let processedContent = content;
  
  // 第一步：處理完整景點名稱
  fullAttractionNames.forEach(attraction => {
    // 只處理還沒有被加粗的景點名稱
    const regex = new RegExp(`(?<!\\*\\*)\\b${escapeRegExp(attraction)}\\b(?!\\*\\*)`, 'g');
    processedContent = processedContent.replace(regex, `**${attraction}**`);
  });
  
  // 第二步：處理包含關鍵詞的潛在景點
  const lines = processedContent.split('\n');
  const processedLines = lines.map(line => {
    // 只處理行程相關的行（包含時間描述的行）
    if (line.includes('上午') || line.includes('下午') || line.includes('傍晚') || 
        line.includes('早上') || line.includes('中午') || line.includes('晚上') ||
        line.includes('*') && (line.includes('參觀') || line.includes('前往') || line.includes('遊覽'))) {
      
      let processedLine = line;
      
      // 尋找可能是景點但沒有加粗的詞彙
      attractionKeywords.forEach(keyword => {
        // 匹配模式：前綴+關鍵詞，但還沒有被加粗
        prefixes.forEach(prefix => {
          const fullName = prefix + keyword;
          if (processedLine.includes(fullName) && !processedLine.includes(`**${fullName}**`)) {
            const regex = new RegExp(`(?<!\\*\\*)\\b${escapeRegExp(fullName)}\\b(?!\\*\\*)`, 'g');
            processedLine = processedLine.replace(regex, `**${fullName}**`);
          }
        });
        
        // 也嘗試單獨的關鍵詞，如果它看起來像是一個重要景點
        const keywordRegex = new RegExp(`(\\S{1,6}${escapeRegExp(keyword)})(?!\\*\\*)`, 'g');
        const matches = processedLine.match(keywordRegex);
        if (matches) {
          matches.forEach(match => {
            // 只有當這個詞看起來像景點名稱時才加粗（長度合適且不是動詞）
            if (match.length >= 3 && match.length <= 10 && 
                !match.includes('參觀') && !match.includes('前往') && 
                !match.includes('遊覽') && !match.includes('體驗')) {
              if (!processedLine.includes(`**${match}**`)) {
                processedLine = processedLine.replace(new RegExp(`(?<!\\*\\*)\\b${escapeRegExp(match)}\\b(?!\\*\\*)`, 'g'), `**${match}**`);
              }
            }
          });
        }
      });
      
      return processedLine;
    }
    
    return line;
  });
  
  return processedLines.join('\n');
}

// 輔助函數：轉義正則表達式特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 增強版的移除非重點開頭語句函數
function removeNonEssentialIntros(content) {
  if (!content) return content;
  
  let cleaned = content.trim();
  
  // 第一階段：如果內容包含標準標題，移除標題前的所有非格式化內容
  const firstHeaderMatch = cleaned.match(/(# 第\d+天|## \S+)/);
  if (firstHeaderMatch) {
    const headerIndex = cleaned.indexOf(firstHeaderMatch[0]);
    const beforeHeader = cleaned.substring(0, headerIndex).trim();
    
    // 如果標題前的內容不包含其他標題，且長度適中，可能是開頭語句
    if (beforeHeader.length > 0 && beforeHeader.length < 500 && 
        !beforeHeader.includes('#') && 
        !beforeHeader.includes('*') &&
        !beforeHeader.includes('第') &&
        beforeHeader.split('\n').length < 10) {
      
      console.log('移除標題前的開頭內容:', beforeHeader.substring(0, 100) + '...');
      cleaned = cleaned.substring(headerIndex);
    }
  }
  
  // 第二階段：移除常見的開頭語句模式
  const introPatterns = [
    // 禮貌性回應
    /^好的[，,。]*.*?[。\n]/,
    /^當然[，,。]*.*?[。\n]/,
    /^我很樂意.*?[。\n]/,
    /^我會為您.*?[。\n]/,
    /^我將為您.*?[。\n]/,
    /^我來為您.*?[。\n]/,
    /^讓我為您.*?[。\n]/,
    /^我明白了.*?[。\n]/,
    
    // 確認性語句
    /^以下是.*?[:：][^\n]*\n/,
    /^這裡是.*?[:：][^\n]*\n/,
    /^根據您的要求.*?[。\n]/,
    /^按照您的需求.*?[。\n]/,
    /^基於您提供的.*?[。\n]/,
    
    // 說明性語句
    /^繼續為您.*?[。\n]/,
    /^接下來.*?[。\n]/,
    /^現在.*?[。\n]/,
    /^為了.*?[。\n]/,
    
    // 完整的句子形式
    /^[^#\n]*?，[^#\n]*?[。！？]\s*\n/,
    /^[^#\n]*?。[^#\n]*?\n/,
  ];
  
  let previousLength = cleaned.length;
  for (const pattern of introPatterns) {
    cleaned = cleaned.replace(pattern, '');
    if (cleaned.length !== previousLength) {
      console.log('移除開頭語句模式');
      break; // 只移除一個模式，避免過度處理
    }
  }
  
  // 第三階段：移除孤立的短句（可能是遺漏的開頭語句）
  const lines = cleaned.split('\n');
  const cleanedLines = [];
  let foundFirstHeader = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 檢查是否遇到第一個標題
    if (!foundFirstHeader && (line.startsWith('#') || line.startsWith('## '))) {
      foundFirstHeader = true;
    }
    
    // 如果還沒遇到標題，檢查是否為無關的短句
    if (!foundFirstHeader && line.length > 0) {
      // 如果是短句且不包含重要信息，跳過
      if (line.length < 100 && 
          !line.includes('第') && 
          !line.includes('天') && 
          !line.includes('行程') &&
          !line.includes('##') &&
          !line.includes('#') &&
          /^[^*-•]+$/.test(line)) { // 不是列表項
        
        console.log('跳過可能的開頭短句:', line);
        continue;
      }
    }
    
    cleanedLines.push(lines[i]);
  }
  
  cleaned = cleanedLines.join('\n');
  
  return cleaned.trim();
}

// 新增：驗證AI回應格式的函數
function validateAIResponseFormat(content) {
  const validation = {
    isValid: true,
    issues: [],
    hasHeaders: false,
    hasSubheaders: false,
    hasContent: false,
    score: 0
  };
  
  // 檢查是否有標題
  const dayHeaders = content.match(/# 第\d+天/g) || [];
  const subHeaders = content.match(/## \S+/g) || [];
  
  validation.hasHeaders = dayHeaders.length > 0;
  validation.hasSubheaders = subHeaders.length > 0;
  validation.hasContent = content.length > 100;
  
  if (!validation.hasHeaders) {
    validation.issues.push('缺少天數標題');
    validation.isValid = false;
  }
  
  if (!validation.hasSubheaders) {
    validation.issues.push('缺少子標題');
    validation.isValid = false;
  }
  
  if (!validation.hasContent) {
    validation.issues.push('內容過少');
    validation.isValid = false;
  }
  
  // 檢查是否包含明顯的開頭語句
  const firstLine = content.split('\n')[0].trim();
  const hasIntroPattern = /^(好的|當然|我會|我來|以下是|根據)/;
  if (hasIntroPattern.test(firstLine) && !firstLine.startsWith('#')) {
    validation.issues.push('包含開頭語句');
    validation.isValid = false;
  }
  
  // 計算格式分數
  let score = 0;
  if (validation.hasHeaders) score += 40;
  if (validation.hasSubheaders) score += 30;
  if (validation.hasContent) score += 20;
  if (validation.issues.length === 0) score += 10;
  
  validation.score = score;
  
  return validation;
}

// 新增：內容品質檢查函數
function checkContentQuality(content) {
  const quality = {
    overall: 'good',
    issues: [],
    suggestions: []
  };
  
  const lines = content.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  
  // 檢查內容密度
  if (nonEmptyLines.length < 10) {
    quality.issues.push('內容過於簡單');
    quality.overall = 'poor';
  }
  
  // 檢查結構完整性
  const dayCount = (content.match(/# 第\d+天/g) || []).length;
  const itineraryCount = (content.match(/## 行程/g) || []).length;
  const mealCount = (content.match(/## 用餐推薦/g) || []).length;
  
  if (dayCount > 0) {
    if (itineraryCount < dayCount) {
      quality.issues.push('部分天數缺少行程安排');
    }
    if (mealCount < dayCount) {
      quality.issues.push('部分天數缺少用餐推薦');
    }
  }
  
  // 檢查是否有重複的開頭語句
  const suspiciousPatterns = [
    /好的.*?為您/,
    /當然.*?安排/,
    /以下是.*?行程/,
    /我會.*?規劃/
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(content)) {
      quality.issues.push('可能包含AI開頭語句');
      if (quality.overall === 'good') quality.overall = 'fair';
      break;
    }
  }
  
  if (quality.issues.length === 0) {
    quality.overall = 'excellent';
  } else if (quality.issues.length > 2) {
    quality.overall = 'poor';
  }
  
  return quality;
}

// 新增繼續生成路由 - 修復版
router.post('/continue', async (req, res) => {
  try {
    // 提取請求體內容，同時兼容不同結構的請求
    const { 
      partialContent, 
      originalRequest, 
      content, 
      request, 
      itinerary, 
      metadata 
    } = req.body;
    
    // 確定部分內容
    const actualContent = partialContent || content || itinerary || req.body.content || req.body.itinerary;
    
    // 確定原始請求信息
    const actualRequest = originalRequest || request || metadata || req.body.metadata || {};
    
    // 詳細的請求日誌
    console.log('Continue API請求體結構:', Object.keys(req.body));
    console.log('請求體內容詳細信息:', {
      hasContent: !!actualContent,
      contentType: actualContent ? typeof actualContent : 'N/A',
      contentPreview: actualContent ? String(actualContent).substring(0, 50) + '...' : 'N/A',
    });
    
    if (!actualContent) {
      console.error('繼續生成請求缺少有效內容');
      return res.status(400).json({
        success: false,
        error: '部分內容不能為空',
        code: 'MISSING_CONTENT'
      });
    }
    
    // 提取國家和天數信息
    const country = actualRequest.country || 
                    (req.body.country) || 
                    (req.body.data && req.body.data.metadata && req.body.data.metadata.country) || 
                    '未知國家';
                    
    const daysInput = actualRequest.days || 
                     (req.body.days) || 
                     (req.body.data && req.body.data.metadata && req.body.data.metadata.days) || 
                     '未知天數';
    
    console.log('收到繼續生成請求:', { 
      country, 
      days: daysInput, 
      contentLength: actualContent.length 
    });
    
    // 分析現有內容結構
    const contentAnalysis = analyzeItineraryContent(actualContent);
    console.log('內容分析結果:', contentAnalysis);
    
    // 解析目標天數
    const targetDays = parseDaysInput(daysInput, contentAnalysis.currentDays);
    console.log('解析後的目標天數:', targetDays);
    
    // 如果當前天數已經滿足或超過目標天數，只處理結構補全
    if (contentAnalysis.currentDays >= targetDays) {
      console.log('當前天數已滿足要求，進行結構補全');
      return handleStructureCompletion(res, actualContent, country, contentAnalysis);
    }
    
    // 如果內容已經相當完整但天數不足，繼續生成
    const prompt = buildContinuePrompt(actualContent, country, targetDays, contentAnalysis);
    
    try {
      // 調用AI服務生成回應
      const response = await generateItineraryWithRetry(prompt, 2);
      console.log('AI 繼續生成已完成，回應長度:', response.length);
      
      // 嚴格處理AI回應
      let processedResponse = strictProcessAIResponse(response);
      
      // 智能合併內容
      const finalContent = intelligentMergeContent(actualContent, processedResponse, contentAnalysis);
      
      console.log('Continue API 最終內容長度:', finalContent.length);
      
      return res.json({
        success: true,
        data: {
          continuedItinerary: finalContent,
          completedAt: new Date().toISOString(),
          metadata: {
            originalLength: actualContent.length,
            finalLength: finalContent.length,
            targetDays: targetDays,
            originalDays: contentAnalysis.currentDays,
            generatedAt: new Date().toISOString(),
            analysisResult: contentAnalysis
          }
        }
      });
      
    } catch (aiError) {
      console.error('AI服務生成延續內容錯誤:', aiError);
      return res.status(503).json({
        success: false,
        error: 'AI服務暫時無法使用',
        message: '請稍後再試',
        code: 'AI_SERVICE_UNAVAILABLE'
      });
    }
  } catch (error) {
    console.error('處理繼續生成請求錯誤:', error);
    return res.status(500).json({
      success: false,
      error: '無法處理繼續生成請求',
      message: error.message,
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// 新增：解析天數輸入的函數
function parseDaysInput(daysInput, currentDays) {
  if (!daysInput || daysInput === '未知天數') {
    // 如果沒有指定天數，預設比當前多2天
    return currentDays + 2;
  }
  
  const daysStr = String(daysInput);
  
  // 處理範圍格式 (如 "6-8", "5~7", "3-5天")
  const rangeMatch = daysStr.match(/(\d+)[-~到](\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1]);
    const max = parseInt(rangeMatch[2]);
    
    // 如果當前天數在範圍內，選擇範圍的最大值
    if (currentDays >= min && currentDays <= max) {
      return max;
    }
    // 如果當前天數小於最小值，選擇最大值
    if (currentDays < min) {
      return max;
    }
    // 如果當前天數大於最大值，返回當前天數+1（至少再生成一天）
    return currentDays + 1;
  }
  
  // 處理單一數字格式
  const singleMatch = daysStr.match(/(\d+)/);
  if (singleMatch) {
    const targetDays = parseInt(singleMatch[1]);
    
    // 如果目標天數小於等於當前天數，至少再生成一天
    if (targetDays <= currentDays) {
      return currentDays + 1;
    }
    
    return targetDays;
  }
  
  // 默認情況：比當前多2天
  return currentDays + 2;
}

// 新增：處理結構補全的函數
async function handleStructureCompletion(res, content, country, analysis) {
  if (analysis.missingStructures.length === 0 && analysis.lastDayComplete) {
    // 完全不需要補充
    return res.json({
      success: true,
      data: {
        continuedItinerary: content,
        completedAt: new Date().toISOString(),
        note: '行程已完整，無需補充'
      }
    });
  }
  
  // 構建結構補全提示
  let supplementPrompt = '';
  
  if (!analysis.lastDayComplete) {
    // 最後一天不完整，需要補全最後一天
    supplementPrompt = `請為以下${country}旅遊行程的第${analysis.currentDays}天補全缺失的結構部分。

現有行程的最後一天缺少：${analysis.missingStructures.join('、')}

要求：
1. 只輸出第${analysis.currentDays}天缺失的結構內容
2. 嚴格按照 ## 標題格式
3. 不要包含任何開頭語句或說明
4. 不要重複現有內容
5. 直接輸出格式化的內容
6. ⚠️ 重要：所有景點名稱必須用粗體標記，例如**景點名稱**

參考現有內容的最後部分：
${content.slice(-500)}

請直接輸出缺失的結構：`;
  } else {
    // 其他天數的結構補全
    supplementPrompt = `請為以下${country}旅遊行程補充缺失的結構部分：${analysis.missingStructures.join('、')}

現有行程有${analysis.currentDays}天，請為缺少相應結構的天數補充內容。

要求：
1. 只輸出缺失的結構內容
2. 嚴格按照 # 第X天 和 ## 標題格式
3. 不要包含任何開頭語句或說明
4. 直接輸出格式化的內容
5. ⚠️ 重要：所有景點名稱必須用粗體標記，例如**景點名稱**

完整內容：
${content}`;
  }

  try {
    const supplementResponse = await generateItineraryWithRetry(supplementPrompt, 1);
    const cleanedSupplement = strictProcessAIResponse(supplementResponse);
    
    // 智能插入補充內容
    const finalContent = insertSupplementContent(content, cleanedSupplement, analysis);
    
    return res.json({
      success: true,
      data: {
        continuedItinerary: finalContent,
        completedAt: new Date().toISOString(),
        note: `補充了${analysis.missingStructures.join('、')}`
      }
    });
  } catch (error) {
    console.error('結構補全失敗:', error);
    // 補充失敗，返回原內容
    return res.json({
      success: true,
      data: {
        continuedItinerary: content,
        completedAt: new Date().toISOString(),
        note: '結構補全失敗，返回原內容'
      }
    });
  }
}

// 新增：插入補充內容的函數
function insertSupplementContent(originalContent, supplementContent, analysis) {
  if (!supplementContent || supplementContent.trim().length < 10) {
    return originalContent;
  }
  
  // 如果最後一天不完整，將補充內容插入到最後一天的末尾
  if (!analysis.lastDayComplete && analysis.currentDays > 0) {
    const lastDayRegex = new RegExp(`(# 第${analysis.currentDays}天[\\s\\S]*?)(?=# 第${analysis.currentDays + 1}天|$)`);
    const match = originalContent.match(lastDayRegex);
    
    if (match) {
      const beforeLastDay = originalContent.substring(0, match.index);
      const lastDayContent = match[1];
      const afterLastDay = originalContent.substring(match.index + match[1].length);
      
      return beforeLastDay + lastDayContent + '\n\n' + supplementContent + afterLastDay;
    }
  }
  
  // 默認追加到末尾
  const separator = originalContent.endsWith('\n\n') ? '' : (originalContent.endsWith('\n') ? '\n' : '\n\n');
  return originalContent + separator + supplementContent;
}

// 新增：分析行程內容的函數（改進版）
function analyzeItineraryContent(content) {
  const dayHeaders = content.match(/# 第(\d+)天/g) || [];
  const currentDays = dayHeaders.length;
  
  // 檢查各種結構元素
  const hasItineraryHeaders = (content.match(/## 行程/g) || []).length;
  const hasMealHeaders = (content.match(/## 用餐推薦/g) || []).length;
  const hasAccommodationHeaders = (content.match(/## 住宿推薦/g) || []).length;
  const hasTipsHeaders = (content.match(/## 小建議/g) || []).length;
  
  // 檢查內容完整性
  const contentLines = content.split('\n').filter(line => line.trim().length > 0);
  const hasSubstantialContent = contentLines.length > currentDays * 8; // 每天至少8行內容
  
  // 檢查最後一天是否完整
  const lastDayComplete = checkLastDayCompleteness(content, currentDays);
  
  // 識別缺失的結構（更精確的計算）
  const missingStructures = [];
  const expectedSections = currentDays * 4; // 每天4個結構
  const actualSections = hasItineraryHeaders + hasMealHeaders + hasAccommodationHeaders + hasTipsHeaders;
  
  if (hasItineraryHeaders < currentDays) missingStructures.push('行程');
  if (hasMealHeaders < currentDays) missingStructures.push('用餐推薦');
  if (hasAccommodationHeaders < currentDays) missingStructures.push('住宿推薦');
  if (hasTipsHeaders < currentDays) missingStructures.push('小建議');
  
  return {
    currentDays,
    hasItineraryHeaders,
    hasMealHeaders,
    hasAccommodationHeaders,
    hasTipsHeaders,
    hasSubstantialContent,
    lastDayComplete,
    missingStructures,
    isNearlyComplete: currentDays > 0 && hasSubstantialContent && missingStructures.length <= 1,
    completenessScore: calculateCompletenessScore(currentDays, hasItineraryHeaders, hasMealHeaders, hasAccommodationHeaders, hasTipsHeaders, hasSubstantialContent)
  };
}

// 檢查最後一天的完整性
function checkLastDayCompleteness(content, currentDays) {
  if (currentDays === 0) return false;
  
  const lastDayRegex = new RegExp(`# 第${currentDays}天[\\s\\S]*?(?=# 第${currentDays + 1}天|$)`);
  const lastDayMatch = content.match(lastDayRegex);
  
  if (!lastDayMatch) return false;
  
  const lastDayContent = lastDayMatch[0];
  return lastDayContent.includes('## 行程') && 
         lastDayContent.includes('## 用餐推薦') && 
         lastDayContent.includes('## 住宿推薦') && 
         lastDayContent.includes('## 小建議');
}

// 計算完整性分數
function calculateCompletenessScore(currentDays, itinerary, meals, accommodation, tips, hasContent) {
  if (currentDays === 0) return 0;
  
  const structureScore = (itinerary + meals + accommodation + tips) / (currentDays * 4) * 70;
  const contentScore = hasContent ? 30 : 0;
  
  return Math.min(100, structureScore + contentScore);
}

// 構建精確的繼續提示詞（修復版）
function buildContinuePrompt(content, country, targetDays, analysis) {
  let prompt = '';
  
  if (analysis.currentDays === 0) {
    // 完全重新生成
    prompt = `請生成一個完整的${country} ${targetDays}天旅遊行程。

嚴格按照以下格式，不要包含任何開頭說明：

# 第1天 (地點名稱)

## 行程
* 上午: 具體活動描述
* 下午: 具體活動描述
* 傍晚: 具體活動描述

## 用餐推薦
* 早餐: 餐廳名稱和特色
* 午餐: 餐廳名稱和特色
* 晚餐: 餐廳名稱和特色

## 住宿推薦
* 具體酒店推薦和說明

## 小建議
* 實用建議

重要：直接開始輸出行程，不要任何開頭語句。`;
    
  } else {
    // 繼續現有行程
    const nextDayNumber = analysis.currentDays + 1;
    
    // 確保目標天數合理
    const finalTargetDays = Math.max(targetDays, nextDayNumber);
    
    prompt = `以下是${country}旅遊行程的第1-${analysis.currentDays}天內容。現在需要繼續生成第${nextDayNumber}天到第${finalTargetDays}天的內容。

現有內容分析：
- 已有${analysis.currentDays}天行程
- 目標總天數：${finalTargetDays}天
- 需要生成：第${nextDayNumber}天到第${finalTargetDays}天
- 缺失結構：${analysis.missingStructures.join('、') || '無'}

要求：
1. 直接輸出第${nextDayNumber}天開始的內容
2. 不要包含任何開頭說明、確認語句或禮貌用語
3. 嚴格按照格式：# 第X天 (地點名稱)
4. 每天必須包含：## 行程、## 用餐推薦、## 住宿推薦、## 小建議
5. 保持與現有內容的連貫性
6. ⚠️⚠️ 極其重要：所有景點名稱必須用Markdown粗體標記，例如**景點名稱**，這個要求適用於每一天的每個時段！

現有內容的最後部分：
${content.slice(-300)}

直接開始輸出第${nextDayNumber}天的內容：`;
  }
  
  return prompt;
}

// 嚴格處理AI回應
function strictProcessAIResponse(response) {
  let processed = response.trim();
  
  // 移除代碼塊標記
  processed = processed.replace(/```(?:markdown)?\n?|```$/g, '');
  
  // 更嚴格的開頭語句移除
  const strictIntroPatterns = [
    /^.*?(?=# 第\d+天)/s,  // 移除第一個標題前的所有內容
    /^[^#]*?(?=##\s)/s,    // 移除第一個二級標題前的非標題內容
  ];
  
  // 如果回應包含標準標題，移除標題前的所有內容
  if (processed.includes('# 第') || processed.includes('## ')) {
    for (const pattern of strictIntroPatterns) {
      const match = processed.match(pattern);
      if (match && match[0].trim().length > 0) {
        // 檢查匹配的內容是否為非格式化的開頭語句
        const matchedContent = match[0].trim();
        if (!matchedContent.startsWith('#') && matchedContent.length < 200) {
          console.log('移除開頭語句:', matchedContent.substring(0, 50) + '...');
          processed = processed.replace(pattern, '');
          break;
        }
      }
    }
  }
  
  // 移除常見的開頭語句
  const commonIntros = [
    /^好的[，,。]*.*?[\n\r]/,
    /^當然[，,。]*.*?[\n\r]/,
    /^我會.*?[\n\r]/,
    /^以下是.*?[:：][\n\r]/,
    /^根據.*?[\n\r]/,
    /^繼續.*?[\n\r]/,
  ];
   for (const pattern of commonIntros) {
    processed = processed.replace(pattern, '');
  }

  // 自動修正景點粗體標記
  processed = autoFixAttractionBolding(processed);

  return processed.trim();
}

// 智能合併內容
function intelligentMergeContent(originalContent, newContent, analysis) {
  // 如果新內容為空或太短，返回原內容
  if (!newContent || newContent.trim().length < 20) {
    console.log('新內容太短，返回原內容');
    return originalContent;
  }
  
  // 如果新內容不包含標準格式，嘗試修復
  if (!newContent.includes('# 第') && !newContent.includes('## ')) {
    console.log('新內容缺少標準格式，嘗試包裝');
    newContent = `## 補充信息\n\n${newContent}`;
  }
  
  // 確保合併時有適當的分隔
  let separator = '';
  if (!originalContent.endsWith('\n\n')) {
    separator = originalContent.endsWith('\n') ? '\n' : '\n\n';
  }
  
  return originalContent + separator + newContent;
}

// 儲存行程到 Firebase
router.post('/save-itinerary', async (req, res) => {
  // 設置 CORS 標頭
  const allowedOrigins = [
    'https://front-end-final-tawny.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const itineraryData = req.body;
    
    // 基本驗證
    if (!itineraryData || !itineraryData.content) {
      return res.status(400).json({
        success: false,
        error: '行程內容不能為空'
      });
    }

    // 檢查用戶 ID
    if (!itineraryData.userId) {
      return res.status(400).json({
        success: false,
        error: '缺少用戶識別資訊，請重新登入'
      });
    }

    // 如果欄位不存在，嘗試從內容中提取
    if (!itineraryData.country || !itineraryData.days) {
      const extractedInfo = extractInfoFromItinerary(itineraryData.content);
      
      if (!itineraryData.country && extractedInfo.country) {
        console.log('從內容中提取的國家:', extractedInfo.country);
        itineraryData.country = extractedInfo.country;
      }
      
      if (!itineraryData.days && extractedInfo.days) {
        console.log('從內容中提取的天數:', extractedInfo.days);
        itineraryData.days = extractedInfo.days;
      }
      
      if (!itineraryData.region && extractedInfo.region) {
        itineraryData.region = extractedInfo.region;
      }
      
      if (!itineraryData.type && extractedInfo.type) {
        itineraryData.type = extractedInfo.type;
      }
    }

    // 最終檢查必要欄位
    if (!itineraryData.country) {
      return res.status(400).json({
        success: false,
        error: '無法確定國家，請在前端選擇國家'
      });
    }

    if (!itineraryData.days) {
      return res.status(400).json({
        success: false,
        error: '無法確定旅遊天數，請在前端選擇天數'
      });
    }
    
    // 確保標題格式正確
    if (!itineraryData.title || itineraryData.title === '天行程' || itineraryData.title.trim() === '') {
      // 自動修正標題格式
      itineraryData.title = `${itineraryData.country} ${itineraryData.days}天行程`;
    }
    
    console.log('收到儲存行程請求:', { 
      title: itineraryData.title,
      country: itineraryData.country,
      days: itineraryData.days
    });
    
    // 添加時間戳
    const dataToSave = {
      ...itineraryData,
      timestamp: Date.now()
    };
    
    // 儲存到 Firebase
    const savedData = await firebaseService.saveItinerary(dataToSave);
    
    res.json({
      success: true,
      id: savedData.id,
      expiresAt: savedData.expiresAt,
      message: '行程已成功儲存'
    });
    
  } catch (error) {
    console.error('儲存行程錯誤:', error);
    res.status(500).json({
      success: false,
      error: '無法儲存行程',
      message: error.message
    });
  }
});

// 獲取所有行程列表 (按用戶過濾)
router.get('/itineraries', async (req, res) => {
  try {
    const { userId } = req.query; // 從查詢參數獲取用戶 ID
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少用戶識別資訊'
      });
    }
    
    const itineraries = await firebaseService.getUserItineraries(userId);
    
    res.json({
      success: true,
      itineraries
    });
    
  } catch (error) {
    console.error('獲取行程列表錯誤:', error);
    res.status(500).json({
      success: false,
      error: '無法獲取行程列表',
      message: error.message
    });
  }
});

// 獲取指定ID的行程 (需要用戶ID以確保安全性)
router.get('/itineraries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // 從查詢參數獲取用戶 ID
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: '行程ID不能為空'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少用戶識別資訊'
      });
    }
    
    const itinerary = await firebaseService.getItinerary(id, userId);
    
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        error: '找不到指定ID的行程或您沒有權限訪問該行程'
      });
    }
    
    res.json({
      success: true,
      itinerary
    });
    
  } catch (error) {
    console.error('獲取行程錯誤:', error);
    res.status(500).json({
      success: false,
      error: '無法獲取行程',
      message: error.message
    });
  }
});

// 解析天數範圍（例如："3-5" 或 "6-8" 或 "13+"）
function parseDaysRange(daysStr) {
  if (!daysStr) return { min: 1, max: 1, target: 1 };
  // 確保 daysStr 一定是字串
  if (typeof daysStr === 'number') {
    daysStr = daysStr.toString();
  }
  
  // 處理 "13+" 格式
  if (daysStr.endsWith('+')) {
    const min = parseInt(daysStr.replace('+', ''), 10);
    const max = min + 2; // 假設最多比最小值多2天
    const target = Math.round((min + max) / 2);
    return { min, max, target };
  }
  
  // 處理 "3-5" 格式
  const parts = daysStr.split('-');
  if (parts.length === 2) {
    const min = parseInt(parts[0], 10);
    const max = parseInt(parts[1], 10);
    if (!isNaN(min) && !isNaN(max)) {
      const target = Math.round((min + max) / 2);
      return { min, max, target };
    }
  }
  
  // 處理單一數字格式
  const days = parseInt(daysStr, 10);
  return { min: days, max: days, target: days };
}

// 計算生成的行程天數
function countGeneratedDays(content) {
  if (!content) return 0;
  
  // 使用正則表達式匹配多種標題格式
  const dayHeaders = [];
  
  // 1. 標準 Markdown H1 格式: "# 第X天"
  const h1Matches = content.match(/# 第(\d+)天/g) || [];
  if (h1Matches.length > 0) {
    dayHeaders.push(...h1Matches);
  }
  
  // 2. Markdown H2 格式: "## 第X天"
  const h2Matches = content.match(/## 第(\d+)天/g) || [];
  if (h2Matches.length > 0) {
    dayHeaders.push(...h2Matches);
  }
  
  // 3. 純文本格式: "第X天:" 或 "第X天：" 
  const textMatches = content.match(/第(\d+)天[:：]/g) || [];
  if (textMatches.length > 0 && dayHeaders.length === 0) {
    dayHeaders.push(...textMatches);
  }
  
  // 4. 漢字數字格式: "第一天", "第二天" 等
  if (dayHeaders.length === 0) {
    const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    let chineseDayMatches = [];
    
    for (const num of chineseNums) {
      const matches = content.match(new RegExp(`# 第${num}天`, 'g')) || [];
      chineseDayMatches.push(...matches);
    }
    
    if (chineseDayMatches.length > 0) {
      dayHeaders.push(...chineseDayMatches);
    }
  }
  
  // 檢查最高的天數來避免重復計算 (例如: "第1天" 和 "第一天" 都出現)
  if (dayHeaders.length > 0) {
    // 提取所有數字並找出最大值
    const allDayNumbers = dayHeaders.map(header => {
      const match = header.match(/第(\d+)天/) || [];
      if (match[1]) {
        return parseInt(match[1], 10);
      }
      return 0;
    }).filter(num => num > 0);
    
    if (allDayNumbers.length > 0) {
      return Math.max(...allDayNumbers);
    }
  }
  
  return dayHeaders.length;
}

// 檢查行程內容是否完整 (新增函數)
function checkItineraryCompleteness(content) {
  if (!content) return { isComplete: false, missingInfo: ['空內容'], truncatedDays: [] };
  
  // 以正則表達式分割每一天的內容
  const dayBlocks = content.split(/(?=^# 第\d+天)/gm).filter(block => block.trim());
  
  if (dayBlocks.length === 0) {
    return { isComplete: false, missingInfo: ['未找到任何有效的行程日'], truncatedDays: [] };
  }
  
  const requiredSections = [
    { pattern: /## 行程/, name: '行程' },
    { pattern: /## 用餐推薦/, name: '用餐推薦' },
    { pattern: /## 住宿推薦/, name: '住宿推薦' },
    { pattern: /## 小建議/, name: '小建議' }
  ];
  
  let missingInfo = [];
  let truncatedDays = [];
  
  // 檢查每一天的內容
  dayBlocks.forEach((block, index) => {
    // 取出實際天數
    const dayMatch = block.match(/^# 第(\d+)天/);
    const dayNum = dayMatch ? dayMatch[1] : (index + 1);
    const dayInfo = { day: dayNum, missingSections: [] };
    
    // 檢查每個必要部分
    requiredSections.forEach(section => {
      if (!section.pattern.test(block)) {
        missingInfo.push(`第${dayNum}天缺少${section.name}`);
        dayInfo.missingSections.push(section.name);
      } else {
        // 檢查子標題內容是否充足
        const sectionMatch = block.match(new RegExp(`${section.pattern.source}([\\s\\S]*?)(?=## |$)`, 'i'));
        if (sectionMatch) {
          const sectionContent = sectionMatch[1].trim();
          // 內容少於15個字符被視為不足
          if (sectionContent.length < 15) {
            missingInfo.push(`第${dayNum}天的${section.name}內容不足`);
            dayInfo.missingSections.push(`${section.name}(內容不足)`);
          }
        }
      }
    });
    
    // 如果該天有缺少部分或內容不足，標記為截斷
    if (dayInfo.missingSections.length > 0) {
      truncatedDays.push(dayInfo);
    }
  });
  
  return {
    isComplete: missingInfo.length === 0,
    missingInfo,
    truncatedDays
  };
}

// 提取行程的風格特徵，用於繼續生成時保持一致性
function extractStyleFeatures(content) {
  const features = {
    detailLevel: null,
    specialFocus: null
  };
  
  // 檢測詳細程度
  const avgLineLength = content.split('\n')
    .map(line => line.trim().length)
    .filter(len => len > 10)
    .reduce((sum, len) => sum + len, 0) / 
    (content.split('\n').filter(line => line.trim().length > 10).length || 1);
  
  if (avgLineLength > 80) {
    features.detailLevel = "非常高";
  } else if (avgLineLength > 50) {
    features.detailLevel = "高";
  } else if (avgLineLength > 30) {
    features.detailLevel = "中等";
  } else {
    features.detailLevel = "簡潔";
  }
  
  // 檢測特殊重點
  const contentLower = content.toLowerCase();
  if (contentLower.includes("美食") && 
     (contentLower.match(/餐廳|美食|料理|小吃|飲食|咖啡|甜點/g) || []).length > 10) {
    features.specialFocus = "美食體驗";
  } else if (contentLower.includes("歷史") && 
            (contentLower.match(/歷史|古蹟|博物館|文化|遺址|傳統/g) || []).length > 10) {
    features.specialFocus = "歷史文化";
  } else if (contentLower.includes("自然") && 
            (contentLower.match(/自然|公園|山|湖|海灘|風景|景觀/g) || []).length > 10) {
    features.specialFocus = "自然風光";
  } else if (contentLower.includes("購物") && 
            (contentLower.match(/購物|商店|市場|百貨|商圈|精品/g) || []).length > 10) {
    features.specialFocus = "購物體驗";
  } else if (contentLower.includes("親子") && 
            (contentLower.match(/親子|家庭|兒童|樂園|遊樂|適合孩子/g) || []).length > 10) {
    features.specialFocus = "親子活動";
  } else {
    features.specialFocus = "綜合景點";
  }
  
  return features;
}

// 修改內容驗證邏輯，減少過度嚴格的檢查
function validateItineraryContent(content, targetDays) {
  const errors = [];
  const dayDetails = [];
  
  // 檢查天數
  const dayMatches = content.match(/# 第(\d+)天/g) || [];
  const actualDays = dayMatches.length;
  
  // 調整天數檢查邏輯 - 對於長期行程更嚴格
  let daysTolerance;
  if (targetDays <= 3) {
    daysTolerance = 0; // 短期行程不允許誤差
  } else if (targetDays <= 7) {
    daysTolerance = 1; // 一週內允許1天誤差
  } else {
    daysTolerance = Math.min(2, Math.ceil(targetDays * 0.1)); // 長期行程允許最多2天誤差或10%
  }
  
  if (actualDays < targetDays - daysTolerance) {
    errors.push(`行程天數明顯不足，需要至少${targetDays}天，實際只有${actualDays}天`);
  }
  
  // 簡化的內容檢查 - 只檢查是否有最基本的內容
  let hasAnySubheaders = false;
  for (let day = 1; day <= Math.min(actualDays, targetDays); day++) {
    const dayContent = extractDayContent(content, day);
    const dayInfo = {
      dayNum: day,
      hasContent: !!(dayContent && dayContent.trim().length > 30),
      subheadersValid: true, // 默認為true，減少嚴格檢查
      contentValid: !!(dayContent && dayContent.trim().length > 30),
      missingSubheaders: [],
      contentIssues: []
    };
    
    // 檢查是否有任何子標題結構
    if (dayContent && (dayContent.includes('##') || dayContent.includes('行程') || dayContent.includes('推薦'))) {
      hasAnySubheaders = true;
    }
    
    // 只有在內容明顯過短時才報告問題
    if (!dayContent || dayContent.trim().length < 30) {
      errors.push(`第${day}天內容過短或缺失`);
      dayInfo.contentValid = false;
      dayInfo.contentIssues.push('內容過短');
    }
    
    dayDetails.push(dayInfo);
  }
  
  return {
    headerValid: actualDays >= Math.max(1, targetDays - daysTolerance),
    subheadersValid: hasAnySubheaders, // 只要有任何子標題就算通過
    contentValid: errors.length === 0,
    isValid: actualDays >= Math.max(1, targetDays - daysTolerance) && errors.length === 0,
    errorCount: errors.length,
    actualDays: actualDays,
    targetDays: targetDays,
    errors: errors,
    dayDetails: dayDetails,
    isComplete: actualDays >= targetDays && hasAnySubheaders
  };
}

// 修改合併邏輯
function mergeItineraryContent(original, additional) {
  // 確保不重複合併相同的天數
  const originalDays = (original.match(/# 第(\d+)天/g) || []).map(m => parseInt(m.match(/\d+/)[0]));
  const additionalDays = (additional.match(/# 第(\d+)天/g) || []).map(m => parseInt(m.match(/\d+/)[0]));
  
  // 過濾掉重複的天數內容
  const filteredAdditional = additional.split(/# 第\d+天/).filter((part, index) => {
    if (index === 0) return false; // 第一部分是空的
    const dayNum = additionalDays[index - 1];
    return !originalDays.includes(dayNum);
  });
  
  if (filteredAdditional.length === 0) {
    return original;
  }
  
  // 重新組合
  let result = original;
  filteredAdditional.forEach((part, index) => {
    const dayNum = additionalDays[originalDays.length + index];
    result += `\n\n# 第${dayNum}天${part}`;
  });
  
  return result;
}

// 提取特定天數的內容
function extractDayContent(content, dayNum) {
  try {
    const dayPattern = new RegExp(`# 第${dayNum}天[^#]*?(?=# 第\\d+天|$)`, 's');
    const match = content.match(dayPattern);
    return match ? match[0] : null;
  } catch (error) {
    console.warn(`提取第${dayNum}天內容時發生錯誤:`, error);
    return null;
  }
}

// 安全的內容合併邏輯
function safeMergeContent(originalContent, additionalContent, targetDays) {
  if (!additionalContent || additionalContent.trim().length === 0) {
    return originalContent;
  }
  
  console.log('使用安全合併邏輯...');
  
  // 提取現有天數
  const originalDayMatches = originalContent.match(/# 第(\d+)天/g) || [];
  const originalDays = originalDayMatches.map(m => parseInt(m.match(/\d+/)[0]));
  
  // 提取新增天數
  const additionalDayMatches = additionalContent.match(/# 第(\d+)天/g) || [];
  const additionalDays = additionalDayMatches.map(m => parseInt(m.match(/\d+/)[0]));
  
  console.log(`原始內容天數: ${originalDays.length}, 新內容天數: ${additionalDays.length}, 目標天數: ${targetDays}`);
  
  // 過濾掉重複的天數內容
  let filteredAdditional = additionalContent;
  let duplicateDays = [];
  
  for (const dayNum of additionalDays) {
    if (originalDays.includes(dayNum)) {
      duplicateDays.push(dayNum);
      // 移除重複的天數內容
      const dayPattern = new RegExp(`# 第${dayNum}天[^#]*?(?=# 第\\d+天|$)`, 'gs');
      filteredAdditional = filteredAdditional.replace(dayPattern, '');
    }
  }
  
  if (duplicateDays.length > 0) {
    console.log(`過濾掉重複的天數: ${duplicateDays.join(', ')}`);
  }
  
  // 簡單追加新內容
  let merged = originalContent;
  if (filteredAdditional.trim().length > 0) {
    merged = originalContent + '\n\n' + filteredAdditional.trim();
    console.log('嘗試簡單追加新內容');
  }
  
  const totalDays = (merged.match(/# 第(\d+)天/g) || []).length;
  console.log(`調整後行程天數: ${totalDays}天 (目標: ${targetDays}天)`);
  
  return merged;
}

// 智能內容合併邏輯
function smartMergeContent(originalContent, additionalContent, actualDays, targetDays, contentValidation) {
  // 為了簡化，使用安全合併
  return safeMergeContent(originalContent, additionalContent, targetDays);
}

// AI智能補齊邏輯
async function aiSmartPatch(content, targetDays) {
  // 為了避免過度處理，直接返回原內容
  console.log('跳過AI補齊步驟以避免過度處理');
  return content;
}

// 提取天數區塊
function extractDayBlocks(content) {
  const blocks = [];
  const dayMatches = content.match(/# 第(\d+)天[^#]*?(?=# 第\d+天|$)/gs) || [];
  
  dayMatches.forEach((block, index) => {
    const dayMatch = block.match(/# 第(\d+)天/);
    if (dayMatch) {
      blocks.push({
        dayNum: parseInt(dayMatch[1]),
        content: block
      });
    }
  });
  
  return blocks;
}

// 刪除指定用戶的指定行程
router.delete('/itineraries/:id', async (req, res) => {
  // 設置 CORS 標頭
  const allowedOrigins = [
    'https://front-end-final-tawny.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  try {
    const { id } = req.params;
    const { userId } = req.query; // 從查詢參數獲取用戶 ID
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: '行程ID不能為空'
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少用戶識別資訊'
      });
    }
    
    await firebaseService.deleteUserItinerary(userId, id);
    
    res.json({
      success: true,
      message: '行程已成功刪除'
    });
    
  } catch (error) {
    console.error('刪除行程錯誤:', error);
    res.status(500).json({
      success: false,
      error: '無法刪除行程',
      message: error.message
    });
  }
});

module.exports = router;