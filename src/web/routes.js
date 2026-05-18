const express = require('express');
const router = express.Router();

router.get('/', function (_req, res) {
  res.json({
    name: 'Aliadas API',
    status: 'running',
    api: '/api',
    health: '/api/health',
  });
});

module.exports = router;
