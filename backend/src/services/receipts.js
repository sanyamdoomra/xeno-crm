const { CommunicationLog } = require('../models');

async function processReceipt({ campaignId, customerId, status }) {
  // Update communication log (batching can be implemented here)
  await CommunicationLog.update(
    { status },
    { where: { campaignId, customerId } }
  );
}

module.exports = { processReceipt };
