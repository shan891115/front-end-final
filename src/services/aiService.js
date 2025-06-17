import axios from 'axios';

// 根據環境自動選擇 API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'development' ? 'http://localhost:3333/api' : 'https://final-project-backend-blond.vercel.app/api');

const aiService = {
  async saveItineraryToFirebase(itineraryData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/save-itinerary`, itineraryData);
      return response.data;
    } catch (error) {
      console.error('儲存行程到 Firebase 失敗:', error);
      throw error;
    }
  },

  async getItineraries() {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/itineraries`);
      return response.data;
    } catch (error) {
      console.error('獲取行程列表失敗:', error);
      return { success: false, error: error.message };
    }
  },

  async getItineraryById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/itineraries/${id}`);
      return response.data;
    } catch (error) {
      console.error(`獲取行程 ID:${id} 失敗:`, error);
      return { success: false, error: error.message };
    }
  },

  async healthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  async compareDestinations(urls) {
    try {
      const response = await axios.post(`${API_BASE_URL}/comparison/compare`, {
        urls: urls.map(item => ({
          url: item.url,
          title: item.title
        }))
      });
      
      // 檢查回應中是否包含警告訊息
      if (response.data && response.data.warning) {
        console.warn('API 警告:', response.data.warning);
      }
      
      return response.data;
    } catch (error) {
      console.error('Compare destinations error:', error);
      
      // 處理特殊情況：Firebase 權限錯誤但分析已完成
      if (error.response && 
          error.response.status === 500 && 
          error.response.data && 
          (error.response.data.message?.includes('PERMISSION_DENIED') || 
           error.response.data.message?.includes('permission denied'))) {
        
        console.log('Firebase 儲存失敗，但分析結果已獲取');
        
        // 如果錯誤響應中包含分析數據，則返回它
        if (error.response.data.analysisData) {
          return {
            success: true,
            data: error.response.data.analysisData,
            warning: '結果未儲存到資料庫，但分析已完成'
          };
        }
      }
      
      throw error;
    }
  },

  async sendChatMessage(message, chatHistory, context) {
    try {
      // 只發送必要的 context 數據，避免發送過大的數據
      let simplifiedContext = null;
      
      if (context) {
        // 如果 context 是完整的比較結果，提取重要部分
        if (context.destinations || context.summary) {
          simplifiedContext = {
            destinations: context.destinations || [],
            summary: context.summary || '',
            pros_cons: context.pros_cons || {}
          };
        } else {
          // 如果已經是簡化過的 context，直接使用
          simplifiedContext = context;
        }
      }
      
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        message,
        context: simplifiedContext
      });
      return response.data;
    } catch (error) {
      console.error('Send chat message error:', error);
      throw error;
    }
  },

  async generateItinerary(region, country, days, departureDate, travelType, specialRequirements) {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/itinerary`, {
        region,
        country,
        days,
        departureDate,
        travelType,
        specialRequirements
      });
      return response.data;
    } catch (error) {
      console.error('Generate itinerary error:', error);
      throw error;
    }
  }
};

export default aiService;