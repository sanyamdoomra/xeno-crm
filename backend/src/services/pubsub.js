const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
client.connect();

const CUSTOMER_STREAM = 'customer_ingest';
const ORDER_STREAM = 'order_ingest';
const CAMPAIGN_STREAM = 'campaign_events';


async function publishCustomer(data) {
  // Convert all values to strings for Redis
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value);
  }
  await client.xAdd(CUSTOMER_STREAM, '*', stringData);
}

async function publishOrder(data) {
  // Convert all values to strings for Redis
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value);
  }
  await client.xAdd(ORDER_STREAM, '*', stringData);
}

async function publishCampaign(data) {
  // Convert all values to strings for Redis
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value);
  }
  await client.xAdd(CAMPAIGN_STREAM, '*', stringData);
}

module.exports = { publishCustomer, publishOrder, publishCampaign, client, CUSTOMER_STREAM, ORDER_STREAM, CAMPAIGN_STREAM };
