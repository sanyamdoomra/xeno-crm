const express = require('express');
const router = express.Router();
const { simulateDelivery } = require('../services/vendor');

router.post('/send', async (req, res) => {
  const result = await simulateDelivery(req.body);
  res.json(result);
});

module.exports = router;
