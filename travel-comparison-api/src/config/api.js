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
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://front-end-final-tawny.vercel.app',
      'https://final-project-backend-blond.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  }
};