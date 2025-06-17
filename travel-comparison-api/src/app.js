// 確保 dotenv 在最開始載入
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const config = require('./config/api');
const routes = require('./routes');
const cleanupService = require('./services/cleanupService');
cleanupService.setupCleanupTask();

const app = express();

// 調試：輸出 CORS 配置
console.log('CORS 配置:', config.cors);

// 中間件
// 更強力的 CORS 配置
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('請求來源:', origin);
  
  res.header('Access-Control-Allow-Origin', 'https://front-end-final-tawny.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 處理預檢請求
  if (req.method === 'OPTIONS') {
    console.log('處理預檢請求:', req.url);
    return res.status(200).end();
  }
  
  next();
});

app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));
// 增加請求體大小限制，確保長文本回應能夠處理
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 添加請求日誌
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// 處理預檢請求
app.options('*', cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));

// 路由
app.use('/api', routes);

// 根路徑
app.get('/', (req, res) => {
  res.json({
    message: '旅遊比較API服務正在運行'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '路由不存在',
    path: req.originalUrl
  });
});

// 錯誤處理
app.use((error, req, res, next) => {
  console.error('應用錯誤:', error);
  res.status(500).json({
    error: '伺服器內部錯誤',
    message: process.env.NODE_ENV === 'development' ? error.message : '發生未知錯誤'
  });
});

module.exports = app;