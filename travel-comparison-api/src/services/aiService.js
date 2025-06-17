const axios = require('axios');
const config = require('../config/api');

class GeminiService {
  constructor() {
    this.apiKey = config.gemini.apiKey;
    this.baseUrl = config.gemini.baseUrl;
    this.model = config.gemini.model;
    this.useMockAnalysis = process.env.USE_MOCK_DATA === 'true'; // 添加模擬模式
    
    console.log('Gemini 使用模擬分析:', this.useMockAnalysis);
    
    if (!this.useMockAnalysis && (!this.apiKey || this.apiKey === 'your_gemini_api_key')) {
      console.warn('Gemini API key not set, falling back to mock analysis');
      this.useMockAnalysis = true;
    }
  }

  async analyzeTravelData(scrapedData) {
    // 如果使用模擬模式，返回模擬分析
    if (this.useMockAnalysis) {
      console.log('使用模擬AI分析');
      return this.generateMockAnalysis(scrapedData);
    }

    try {
      const prompt = this.buildComparisonPrompt(scrapedData);
      
      console.log('發送到 Gemini 的提示:', prompt.substring(0, 200) + '...');
      
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30秒超時
        }
      );

      console.log('Gemini 回應:', response.data);

      let analysisText = response.data.candidates[0].content.parts[0].text;
      
      // 清理 Markdown 代碼塊標記
      if (analysisText.includes('```json')) {
        analysisText = analysisText.replace(/```json\n|\n```/g, '');
      } else if (analysisText.includes('```')) {
        analysisText = analysisText.replace(/```\n|\n```/g, '');
      }
      
      return {
        analysis: analysisText,
        usage: response.data.usageMetadata
      };
    } catch (error) {
      console.error('Gemini API error:', error.response?.data || error.message);
      throw new Error('Failed to analyze travel data with Gemini: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  buildComparisonPrompt(scrapedData) {
    const urls = scrapedData.map(item => item.url).join(', ');
    
    console.log('構建提示詞時的爬蟲數據:', scrapedData.map(item => ({
      url: item.url,
      hasData: !!item.data,
      dataKeys: item.data ? Object.keys(item.data) : [],
      dataStructure: item.data?.data ? Object.keys(item.data.data) : []
    })));
    
    const contents = scrapedData.map((item, index) => {
      let content = '無法獲取內容';
      
      if (item.data && item.data.data) {
        // Firecrawl v1 API 結構
        const scraped = item.data.data;
        content = scraped.markdown || scraped.html || scraped.content || '無法獲取內容';
      } else if (item.data) {
        // 舊版或其他結構
        content = item.data.markdown || item.data.html || item.data.content || '無法獲取內容';
      }
      
      console.log(`目的地 ${index + 1} 內容長度:`, content.length);
      
      return `### 目的地 ${index + 1}: ${item.url}\n${content.substring(0, 3000)}...`; // 限制內容長度
    }).join('\n\n');

    return `
請分析以下旅遊網站內容，並提供詳細的比較分析。請以 JSON 格式回應：

${contents}

請直接提供以下格式的JSON回應（請確保是有效的JSON格式，不要使用嵌套的 "comparison" 對象）：
{
  "destinations": [
    {
      "name": "目的地名稱",
      "cost": "平均消費水平",
      "climate": "氣候特點",
      "transport": "交通便利性",
      "attractions": "主要景點數量/類型",
      "food": "當地美食特色",
      "bestFor": "適合的旅客類型"
    }
  ],
  "summary": "綜合比較總結，包含推薦建議",
  "pros_cons": {
    "destination1": {
      "pros": ["優點1", "優點2"],
      "cons": ["缺點1", "缺點2"]
    },
    "destination2": {
      "pros": ["優點1", "優點2"],
      "cons": ["缺點1", "缺點2"]
    }
  }
}

請用繁體中文回應，並確保分析客觀準確。重要提示：
1. 請只回傳純 JSON 數據，不要包含 Markdown 代碼塊(如 \`\`\`json)或其他說明文字
2. 不要在 JSON 中使用嵌套的 "comparison" 對象，直接使用上面的格式
3. 確保所有鍵名都是字符串類型，不要使用數字或其他類型作為鍵名
`;
  }

  async chatWithAI(message, context = null) {
    // 如果使用模擬模式，返回模擬回應
    if (this.useMockAnalysis) {
      console.log('使用模擬AI聊天回應');
      return this.generateMockChatResponse(message, context);
    }

    try {
      let prompt = message;
      // 確保 context 是字符串格式
      let contextStr = '';
      if (context) {
        try {
          contextStr = typeof context === 'string' ? context : JSON.stringify(context, null, 2);
          prompt = `基於以下旅遊比較分析：\n${contextStr}\n\n用戶問題：${message}\n\n請提供有用的旅遊建議。`;
        } catch (e) {
          console.warn('無法序列化 context:', e);
          // 如果無法序列化，則忽略 context
        }
      }

      console.log('發送聊天請求到 Gemini:', prompt.substring(0, 100) + '...');

      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini chat error:', error.response?.data || error.message);
      throw new Error('Failed to chat with Gemini AI: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  generateMockAnalysis(scrapedData) {
    // 從爬取的數據中提取信息
    const destinations = scrapedData.map((item, index) => {
      const url = item.url;
      let name = `目的地 ${index + 1}`;
      let description = '這是一個美麗的旅遊目的地。';
      let cost = '中等';
      let climate = '四季分明';
      let attractions = ['景點1', '景點2', '景點3'];
      let pros = ['優點1', '優點2'];
      let cons = ['缺點1', '缺點2'];

      // 根據URL或內容自定義分析
      if (url && url.includes('taiwan')) {
        name = '台灣';
        description = '美麗的寶島，擁有豐富的自然景觀和文化遺產。';
        cost = '中等偏低';
        climate = '亞熱帶海洋性氣候';
        attractions = ['台北101', '太魯閣國家公園', '阿里山', '日月潭'];
        pros = ['美食豐富', '交通便利', '文化多元', '安全性高'];
        cons = ['夏季炎熱', '颱風季節'];
      } else if (url && (url.includes('japan') || url.includes('日本'))) {
        name = '日本';
        description = '融合傳統與現代的島國，擁有獨特的文化魅力。';
        cost = '中等偏高';
        climate = '溫帶海洋性氣候';
        attractions = ['富士山', '東京塔', '京都清水寺', '大阪城'];
        pros = ['文化豐富', '服務品質高', '四季分明', '交通發達'];
        cons = ['消費較高', '語言障礙'];
      } else if (url && (url.includes('korea') || url.includes('韓國'))) {
        name = '韓國';
        description = '充滿活力的半島國家，K-culture的發源地。';
        cost = '中等';
        climate = '溫帶大陸性氣候';
        attractions = ['景福宮', 'N首爾塔', '濟州島', '釜山海雲台'];
        pros = ['流行文化', '美食多樣', '購物便利', '歷史悠久'];
        cons = ['空氣品質', '政治緊張'];
      }

      return {
        name,
        description,
        cost,
        climate,
        attractions,
        pros,
        cons
      };
    });

    const mockAnalysis = {
      summary: `本次比較分析了 ${destinations.length} 個旅遊目的地：${destinations.map(d => d.name).join('、')}。每個目的地都有其獨特的魅力和特色。根據分析，這些目的地在消費水平、氣候條件、主要景點等方面都有不同的特點。建議遊客根據個人偏好、預算和旅遊時間來選擇最適合的目的地。總體而言，這些都是值得推薦的優秀旅遊選擇。`,
      destinations,
      recommendations: {
        budget: destinations.find(d => d.cost.includes('低')) ? destinations.find(d => d.cost.includes('低')).name : destinations[0].name,
        culture: destinations.find(d => d.pros.some(p => p.includes('文化'))) ? destinations.find(d => d.pros.some(p => p.includes('文化'))).name : destinations[0].name,
        nature: destinations.find(d => d.attractions.some(a => a.includes('國家公園') || a.includes('山'))) ? destinations.find(d => d.attractions.some(a => a.includes('國家公園') || a.includes('山'))).name : destinations[0].name
      }
    };

    return {
      analysis: JSON.stringify(mockAnalysis, null, 2),
      usage: {
        promptTokenCount: 500,
        candidatesTokenCount: 800,
        totalTokenCount: 1300
      }
    };
  }

  // 生成模擬聊天回應
  generateMockChatResponse(message, context) {
    const responses = [
      `根據您的旅遊目的地比較，我建議您考慮 ${context && context.destinations ? context.destinations[0].name : '第一個目的地'}，因為它提供了很好的性價比和豐富的旅遊體驗。`,
      '您好！我可以回答您關於這些旅遊目的地的任何問題。您想了解哪方面的信息？例如住宿、美食、交通或景點推薦？',
      '根據分析，如果您偏好文化體驗，我推薦選擇有豐富歷史遺跡的目的地。如果您更喜歡自然風光，可以選擇有國家公園或山區的地方。',
      '旅遊預算是一個重要考量因素。您可以根據比較表中的消費水平選擇最適合您預算的目的地。',
      '最佳旅遊時間取決於您選擇的目的地。通常春季和秋季是最舒適的旅遊季節，夏季可能炎熱，冬季則可能較冷。',
      '如果您是帶著家人旅行，我建議選擇有親子活動的目的地。如果是情侶旅行，可以考慮有浪漫景點的地方。'
    ];

    // 根據問題關鍵詞選擇更相關的回應
    let response = '';
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('預算') || lowerMessage.includes('價格') || lowerMessage.includes('花費')) {
      response = '根據比較分析，各目的地的消費水平有所不同。如果您預算有限，建議選擇標記為"中等偏低"消費水平的目的地。您也可以通過選擇經濟型住宿和使用公共交通工具來節省開支。';
    } else if (lowerMessage.includes('天氣') || lowerMessage.includes('氣候') || lowerMessage.includes('季節')) {
      response = '不同目的地的氣候條件各異。建議您在計劃行程時考慮目的地的季節性因素。一般來說，避開雨季和極端天氣的時期是明智的選擇。根據比較表，您可以選擇最適合您偏好氣候的目的地。';
    } else if (lowerMessage.includes('景點') || lowerMessage.includes('參觀') || lowerMessage.includes('遊覽')) {
      response = '每個目的地都有其獨特的景點。建議您根據自己的興趣選擇：如果喜歡自然風光，可以選擇有國家公園或山區的目的地；如果偏好文化體驗，則可以選擇有歷史遺跡或博物館的地方。';
    } else if (lowerMessage.includes('食物') || lowerMessage.includes('美食') || lowerMessage.includes('餐廳')) {
      response = '美食是旅遊體驗的重要部分。每個目的地都有其特色美食，建議您嘗試當地的傳統料理。街頭小吃往往是體驗當地飲食文化的好方式，而且通常價格合理。';
    } else if (lowerMessage.includes('交通') || lowerMessage.includes('移動') || lowerMessage.includes('車')) {
      response = '各目的地的交通便利性不同。有些地方公共交通系統發達，有些則可能需要租車或參加旅遊團。建議您提前研究目的地的交通選項，並根據自己的需求做出選擇。';
    } else if (lowerMessage.includes('住宿') || lowerMessage.includes('酒店') || lowerMessage.includes('飯店')) {
      response = '住宿選擇應考慮位置、價格和設施。市中心的住宿通常更方便但價格較高，郊區則可能更安靜且價格合理。許多目的地也提供特色住宿，如民宿或精品酒店，可以增添旅遊體驗。';
    } else if (lowerMessage.includes('安全') || lowerMessage.includes('危險')) {
      response = '旅遊安全是重要考量。大多數熱門旅遊目的地都相對安全，但仍建議您注意個人財物安全，避免夜間單獨前往偏遠地區，並購買旅遊保險。也請關注目的地的最新旅遊警告。';
    } else if (lowerMessage.includes('推薦') || lowerMessage.includes('建議')) {
      response = '根據您的比較結果，我建議您考慮最符合您主要需求的目的地。如果您重視性價比，選擇消費水平較低的地方；如果您追求特定體驗，則選擇在該方面評分較高的目的地。';
    } else {
      // 隨機選擇一個通用回應
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return response;
  }
}

module.exports = new GeminiService();