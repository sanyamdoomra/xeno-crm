const { Segment, Customer, Campaign, CommunicationLog } = require('../models');

async function createSegment(segmentData) {
  // Save segment and return preview size
  const segment = await Segment.create(segmentData);
  
  // Calculate audience size based on rules (simplified logic)
  const audienceSize = await Customer.count();
  
  // Create campaign automatically when segment is saved
  if (segmentData.name) {
    const campaign = await Campaign.create({
      name: segmentData.name,
      segmentId: segment.id,
      message: `Hi there! Here's a special offer just for you - 10% off your next purchase!`,
      stats: { 
        audienceSize: audienceSize,
        sent: Math.floor(audienceSize * 0.9), // Simulate 90% delivery
        failed: Math.floor(audienceSize * 0.1) // Simulate 10% failure
      }
    });
    
    // Create communication logs for each customer
    const customers = await Customer.findAll();
    for (const customer of customers) {
      const status = Math.random() < 0.9 ? 'SENT' : 'FAILED';
      await CommunicationLog.create({
        campaignId: campaign.id,
        customerId: customer.id,
        status: status
      });
    }
  }
  
  return { ...segment.toJSON(), audienceSize };
}

module.exports = { createSegment };
