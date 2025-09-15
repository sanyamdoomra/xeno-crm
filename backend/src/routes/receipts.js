const express = require('express');
const router = express.Router();
const { processReceipt } = require('../services/receipts');

router.post('/', async (req, res) => {
  await processReceipt(req.body);
  res.json({ status: 'updated' });
});

module.exports = router;
