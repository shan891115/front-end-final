module.exports = {
  firecrawl: {
    apiKey: process.env.FIRECRAWL_API_KEY, // 移除預設值，讓錯誤更明確
    baseUrl: process.env.FIRECRAWL_API_URL || 'https://api.firecrawl.dev/v1'
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY, // 移除預設值
    baseUrl: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta',
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
  },
  cors: {
    origin: '*', // 暫時允許所有來源，以測試是否是 CORS 問題
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  }
};