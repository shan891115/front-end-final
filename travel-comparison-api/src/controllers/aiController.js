const firecrawlService = require('../services/firecrawlService');
const aiService = require('../services/aiService');
const dataProcessor = require('../services/dataProcessor');

class AiController {
  async scrapeAndProcessUrls(req, res) {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ message: '請提供有效的網址陣列' });
    }

    try {
      // 使用 Firecrawl 服務抓取網址
      const scrapedData = await firecrawlService.scrapeUrls(urls);
      
      // 處理抓取的數據
      const processedData = dataProcessor.processData(scrapedData);
      
      // 發送處理後的數據到 AI API
      const aiResponse = await aiService.sendDataToAi(processedData);
      
      return res.status(200).json(aiResponse);
    } catch (error) {
      console.error('處理請求時發生錯誤:', error);
      return res.status(500).json({ message: '伺服器錯誤，請稍後再試' });
    }
  }
}

module.exports = new AiController();