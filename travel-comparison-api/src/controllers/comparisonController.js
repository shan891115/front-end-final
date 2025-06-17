const firecrawlService = require('../services/firecrawlService');
const aiService = require('../services/aiService');
const firebaseService = require('../services/firebaseService');

class ComparisonController {
  async compareDestinations(req, res) {
    try {
      const { urls } = req.body;
      
      if (!urls || urls.length < 2) {
        return res.status(400).json({
          error: '需要至少兩個URL進行比較'
        });
      }

      console.log('開始爬取網站:', urls);

      // 處理URLs的格式 - 支持字符串數組或對象數組
      const urlsToScrape = urls.map(item => {
        return typeof item === 'string' ? item : item.url;
      });

      // 步驟1: 使用 Firecrawl 爬取網站內容
      const scrapedData = await firecrawlService.scrapeMultipleUrls(urlsToScrape);

      console.log('爬取結果:', scrapedData.map(d => ({
        url: d.url,
        success: d.success,
        hasData: !!d.data
      })));

      // 檢查是否有成功爬取的數據
      const successfulScrapes = scrapedData.filter(item => item.success);
      
      if (successfulScrapes.length < 2) {
        return res.status(400).json({
          error: '無法成功爬取足夠的網站內容進行比較',
          details: scrapedData
        });
      }

      // 步驟2: 使用 Gemini AI 分析爬取的內容
      console.log('開始AI分析...');
      const analysis = await aiService.analyzeTravelData(successfulScrapes);
      console.log('AI 分析完成:', analysis);

      // 準備返回的數據
      const comparisonData = {
        scrapedData: successfulScrapes,
        analysis: analysis.analysis,
        usage: analysis.usage,
        totalUrls: urls.length,
        successfulScrapes: successfulScrapes.length
      };

      // 步驟3: 嘗試將結果儲存到 Firebase
      try {
        // 儲存到 Firebase 並獲取唯一 ID
        const savedData = await firebaseService.saveComparison(comparisonData);

        res.json({
          success: true,
          data: {
            ...comparisonData,
            id: savedData.id,
            expiresAt: savedData.expiresAt
          }
        });
      } catch (firebaseError) {
        console.error('儲存比較資料錯誤:', firebaseError);
        
        // 即使 Firebase 儲存失敗，仍返回分析結果
        res.status(500).json({
          error: '儲存比較資料失敗，但分析已完成',
          message: firebaseError.message,
          analysisData: comparisonData,
          code: firebaseError.code || 'UNKNOWN_ERROR'
        });
      }
    } catch (error) {
      console.error('比較控制器錯誤:', error);
      res.status(500).json({
        error: '伺服器內部錯誤',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // 新增: 根據 ID 獲取比較結果
  async getComparisonById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          error: '需要提供比較 ID'
        });
      }

      const comparisonData = await firebaseService.getComparison(id);
      
      if (!comparisonData) {
        return res.status(404).json({
          error: '找不到比較資料或已過期'
        });
      }

      res.json({
        success: true,
        data: comparisonData
      });
    } catch (error) {
      console.error('獲取比較資料錯誤:', error);
      res.status(500).json({
        error: '伺服器內部錯誤',
        message: error.message
      });
    }
  }
}

module.exports = new ComparisonController();