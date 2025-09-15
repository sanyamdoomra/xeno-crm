const express = require('express');
const router = express.Router();
const { validateCustomer } = require('../validators');
const { publishCustomer } = require('../services/pubsub');
const { Customer } = require('../models');

router.post('/', async (req, res) => {
  try {
    console.log('Customer POST request body:', req.body);
    
    const { error } = validateCustomer(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      return res.status(400).json({ error: error.details[0].message });
    }
    
    // Publish to Redis Stream for async processing
    console.log('Publishing to Redis...');
    await publishCustomer(req.body);
    console.log('Published to Redis successfully');
    
    // Also save directly to database for immediate availability
    console.log('Saving to database...');
    const customer = await Customer.create(req.body);
    console.log('Customer created:', customer.toJSON());
    
    res.json({ status: 'queued', customerId: customer.id });
  } catch (error) {
    console.error('Error in customer route:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
