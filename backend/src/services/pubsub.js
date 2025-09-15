
let client = null;
let useUpstash = false;
const fetch = require('node-fetch');

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  useUpstash = true;
} else {
  const redis = require('redis');
  client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  client.connect();
}

const CUSTOMER_STREAM = 'customer_ingest';
const ORDER_STREAM = 'order_ingest';
const CAMPAIGN_STREAM = 'campaign_events';



async function publishCustomer(data) {
  // Convert all values to strings for Redis
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value);
  }
  if (useUpstash) {
    // Upstash XADD via REST
    const entries = Object.entries(stringData).flat();
    const body = {
      command: ["XADD", CUSTOMER_STREAM, "*", ...entries]
    };
    await fetch(UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } else {
    await client.xAdd(CUSTOMER_STREAM, '*', stringData);
  }
}


async function publishOrder(data) {
  // Convert all values to strings for Redis
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value);
  }
  if (useUpstash) {
    const entries = Object.entries(stringData).flat();
    const body = {
      command: ["XADD", ORDER_STREAM, "*", ...entries]
    };
    await fetch(UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } else {
    await client.xAdd(ORDER_STREAM, '*', stringData);
  }
}


async function publishCampaign(data) {
  // Convert all values to strings for Redis
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value);
  }
  if (useUpstash) {
    const entries = Object.entries(stringData).flat();
    const body = {
      command: ["XADD", CAMPAIGN_STREAM, "*", ...entries]
    };
    await fetch(UPSTASH_REDIS_REST_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
  } else {
    await client.xAdd(CAMPAIGN_STREAM, '*', stringData);
  }
}

module.exports = { publishCustomer, publishOrder, publishCampaign, client, CUSTOMER_STREAM, ORDER_STREAM, CAMPAIGN_STREAM };
