const { Campaign } = require('../models');

async function listCampaigns() {
  return await Campaign.findAll({ order: [['createdAt', 'DESC']] });
}

module.exports = { listCampaigns };
