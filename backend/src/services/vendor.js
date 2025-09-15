const axios = require('axios');

async function simulateDelivery({ customer, message, campaignId }) {
  // Simulate 90% success, 10% failure
  const isSuccess = Math.random() < 0.9;
  const status = isSuccess ? 'SENT' : 'FAILED';
  // Simulate callback to delivery receipt API
  await axios.post('http://localhost:4000/api/receipts', {
    campaignId,
    customerId: customer.id,
    status
  });
  return { status };
}

module.exports = { simulateDelivery };
