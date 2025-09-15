const express = require('express');
const router = express.Router();
const { listCampaigns } = require('../services/campaigns');
const { Campaign, Segment, Customer, CommunicationLog } = require('../models');
const pubsub = require('../services/pubsub');

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const { segmentId, name, message, tags } = req.body;
    
    console.log('Creating campaign:', { segmentId, name, message, tags });
    
    // Get the segment and its audience
    const segment = await Segment.findByPk(segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }
    
    // Create campaign with AI-generated tags
    const campaign = await Campaign.create({
      name: name || `Campaign for Segment ${segmentId}`,
      message,
      segmentId,
      tags: Array.isArray(tags) ? tags.join(', ') : '',
      stats: JSON.stringify({
        audienceSize: segment.audienceSize,
        sent: Math.floor(segment.audienceSize * 0.9), // Simulate 90% delivery
        failed: Math.ceil(segment.audienceSize * 0.1)  // Simulate 10% failure
      })
    });
    
    // Simulate message delivery and log communications
    const customers = await Customer.findAll({ limit: segment.audienceSize });
    const communications = [];
    
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const status = Math.random() > 0.1 ? 'SENT' : 'FAILED'; // 90% success rate
      
      communications.push({
        campaignId: campaign.id,
        customerId: customer.id,
        status,
        sentAt: new Date(),
        message
      });
    }
    
    await CommunicationLog.bulkCreate(communications);
    console.log(`Created ${communications.length} communication logs`);
    
    // Publish to Redis
    await pubsub.publishCampaign(campaign);
    
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const campaigns = await listCampaigns();
  res.json(campaigns);
});

module.exports = router;
