const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');

router.post('/compare', comparisonController.compareDestinations);
router.get('/:id', comparisonController.getComparisonById);

module.exports = router;