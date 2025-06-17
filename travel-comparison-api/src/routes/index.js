const express = require('express');
const router = express.Router();

const comparisonRoutes = require('./comparison');
const aiRoutes = require('./ai');

// 測試路由
router.get('/', (req, res) => {
  res.json({
    message: 'Travel Comparison API is running',
    endpoints: [
      'POST /api/comparison/compare',
      'POST /api/ai/chat'
    ],
    timestamp: new Date().toISOString()
  });
});

router.use('/comparison', comparisonRoutes);
router.use('/ai', aiRoutes);

module.exports = router;