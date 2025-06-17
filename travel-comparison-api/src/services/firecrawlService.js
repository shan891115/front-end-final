const FirecrawlApp = require('@mendable/firecrawl-js').default;
const config = require('../config/api');

class FirecrawlService {
  constructor() {
    this.apiKey = config.firecrawl.apiKey;
    this.useMockData = process.env.USE_MOCK_DATA === 'true';
    
    console.log('Firecrawl API Key:', this.apiKey ? '已設定' : '未設定');
    console.log('使用模擬數據:', this.useMockData);
    
    // 如果不是模擬模式，檢查 API key 並初始化 SDK
    if (!this.useMockData && (!this.apiKey || this.apiKey === 'your_firecrawl_api_key' || this.apiKey.trim() === '')) {
      console.warn('Firecrawl API key is not set. Falling back to mock data mode.');
      this.useMockData = true;
    }
    
    // 初始化 Firecrawl SDK
    if (!this.useMockData) {
      this.app = new FirecrawlApp({ apiKey: this.apiKey });
      console.log('Firecrawl SDK 初始化完成');
    }
  }

  async scrapeUrl(url) {
    // 如果使用模擬模式，返回模擬數據
    if (this.useMockData) {
      console.log(`模擬爬取: ${url}`);
      return this.generateMockData(url);
    }

    try {
      console.log(`開始爬取: ${url}`);
      console.log(`使用 Firecrawl SDK`);
      
      // 使用官方 SDK 進行爬取
      const scrapeResponse = await this.app.scrapeUrl(url, {
        formats: ['markdown', 'html']
      });
      
      console.log(`爬取成功: ${url}`);
      console.log('回應數據結構:', Object.keys(scrapeResponse || {}));
      
      // 檢查返回的數據是否有內容
      if (scrapeResponse && scrapeResponse.success) {
        const content = scrapeResponse.data;
        console.log('內容詳情:', {
          markdown: content?.markdown?.length || 0,
          html: content?.html?.length || 0,
          metadata: content?.metadata ? Object.keys(content.metadata) : []
        });
        
        return scrapeResponse;
      } else {
        console.log('SDK 響應格式異常:', scrapeResponse);
        throw new Error('SDK response format is incorrect');
      }
      
    } catch (error) {
      console.error(`爬取失敗 ${url}:`);
      console.error('錯誤訊息:', error.message);
      
      // 提供更詳細的錯誤信息
      let errorMessage = `Failed to scrape URL: ${url}`;
      if (error.message.includes('401')) {
        errorMessage += ' - API Key 無效或過期';
      } else if (error.message.includes('429')) {
        errorMessage += ' - API 請求限制已達上限';
      } else if (error.message.includes('400')) {
        errorMessage += ' - 請求格式錯誤或 URL 無效';
      } else {
        errorMessage += ` - ${error.message}`;
      }
      
      throw new Error(errorMessage);
    }
  }

  async scrapeMultipleUrls(urls) {
    console.log('開始批量爬取:', urls);
    
    const results = [];
    
    // 序列化處理，避免同時發送太多請求
    for (const url of urls) {
      try {
        const data = await this.scrapeUrl(url);
        results.push({
          url: url,
          success: true,
          data: data,
          error: null
        });
      } catch (error) {
        results.push({
          url: url,
          success: false,
          data: null,
          error: error.message
        });
      }
    }
    
    console.log('批量爬取完成:', results.map(r => ({
      url: r.url,
      success: r.success
    })));
    
    return results;
  }

  generateMockData(url) {
    // 根據URL生成不同的模擬數據
    const mockData = {
      success: true,
      data: {
        markdown: '',
        html: '',
        metadata: {
          title: '',
          description: '',
          language: 'zh-TW',
          sourceURL: url,
          statusCode: 200
        }
      }
    };

    // 根據URL內容生成不同的模擬數據
    if (url.includes('taiwan') || url.includes('台灣') || url.includes('臺灣')) {
      mockData.data.markdown = `# 台灣旅遊指南

## 台灣概述
台灣是一個美麗的島嶼，擁有豐富的自然景觀和文化遺產。從繁華的台北到古老的台南，每個城市都有其獨特的魅力。

## 主要景點
- **台北101**: 世界知名的摩天大樓，可欣賞台北市全景
- **太魯閣國家公園**: 壯麗的峽谷和大理石峭壁
- **阿里山**: 著名的日出和櫻花景觀
- **日月潭**: 台灣最大的天然湖泊

## 美食文化
台灣以夜市文化聞名，各種小吃如牛肉麵、小籠包、珍珠奶茶等都是必嚐美食。

## 交通資訊
台灣的高鐵和捷運系統非常發達，遊客可以輕鬆往返各個城市。

## 最佳旅遊時間
春季(3-5月)和秋季(9-11月)是最適合旅遊的季節，氣候宜人。`;
      
      mockData.data.metadata.title = '台灣旅遊完整指南';
      mockData.data.metadata.description = '探索台灣的美麗景點、美食文化和旅遊資訊';
    } 
    else if (url.includes('japan') || url.includes('日本') || url.includes('東京') || url.includes('tokyo')) {
      mockData.data.markdown = `# 日本旅遊指南

## 日本概述
日本是一個融合傳統與現代的國家，從古老的寺廟到現代的摩天大樓，展現了獨特的文化魅力。

## 主要景點
- **東京塔**: 東京的象徵性建築，可俯瞰整個城市
- **富士山**: 日本最高峰，是日本的象徵
- **京都清水寺**: 古老的木造寺廟，UNESCO世界遺產
- **大阪城**: 日本最著名的城堡之一

## 美食文化
日本料理以新鮮食材和精緻烹飪聞名，壽司、拉麵、天婦羅等都是經典美食。

## 交通資訊
JR Pass是外國遊客的最佳選擇，可以無限制搭乘JR線路。

## 最佳旅遊時間
春季(3-5月)櫻花季和秋季(9-11月)紅葉季是最受歡迎的旅遊時間。

## 文化體驗
- 溫泉體驗
- 茶道文化
- 和服體驗
- 傳統祭典`;
      
      mockData.data.metadata.title = '日本旅遊完整攻略';
      mockData.data.metadata.description = '探索日本的文化、美食、景點和旅遊建議';
    }
    else if (url.includes('korea') || url.includes('韓國') || url.includes('首爾') || url.includes('seoul')) {
      mockData.data.markdown = `# 韓國旅遊指南

## 韓國概述
韓國是一個充滿活力的國家，K-pop、韓劇、美食和歷史文化吸引著世界各地的遊客。

## 主要景點
- **景福宮**: 朝鮮王朝的主要宮殿
- **N首爾塔**: 首爾的地標建築
- **濟州島**: 韓國最大的島嶼，自然風光優美
- **釜山海雲台**: 韓國最著名的海灘

## 美食文化
韓式燒肉、泡菜、拌飯、韓式炸雞等都是不可錯過的美食。

## 購物天堂
明洞、東大門、弘大等地區是購物和娛樂的熱門地點。

## 最佳旅遊時間
春季(4-6月)和秋季(9-11月)氣候最為舒適。

## K-Culture體驗
- K-pop演唱會
- 韓劇拍攝地
- 汗蒸幕體驗
- 韓服體驗`;
      
      mockData.data.metadata.title = '韓國旅遊全攻略';
      mockData.data.metadata.description = '體驗韓國的流行文化、美食和傳統文化';
    }
    else {
      // 通用旅遊資訊
      mockData.data.markdown = `# 旅遊目的地指南

## 目的地概述
這是一個美麗的旅遊目的地，擁有豐富的文化和自然景觀。

## 主要景點
- 歷史古蹟和文化遺址
- 自然景觀和國家公園
- 博物館和藝術館
- 購物和娛樂區域

## 美食特色
當地擁有獨特的美食文化，值得遊客品嚐。

## 交通資訊
提供便利的交通網絡，方便遊客出行。

## 旅遊建議
- 提前規劃行程
- 了解當地文化和習俗
- 準備適合的服裝
- 保持安全意識

## 最佳旅遊時間
全年都適合旅遊，但請根據當地氣候選擇合適的時間。`;
      
      mockData.data.metadata.title = '旅遊目的地指南';
      mockData.data.metadata.description = '探索美麗的旅遊目的地';
    }

    // 生成對應的HTML內容
    mockData.data.html = `<html><body>${mockData.data.markdown.replace(/\n/g, '<br>')}</body></html>`;

    return mockData;
  }
}

module.exports = new FirecrawlService();