const express = require('express');
const router = express.Router();
const { validateOrder } = require('../validators');
const { publishOrder } = require('../services/pubsub');
const { Order } = require('../models');

router.post('/', async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  
  // Publish to Redis Stream for async processing
  await publishOrder(req.body);
  
  // Also save directly to database for immediate availability
  const order = await Order.create(req.body);
  
  res.json({ status: 'queued', orderId: order.id });
});

module.exports = router;
