// ai/providers/cohere.js
const axios = require('axios');

async function getCohereResponse({ prompt, context = null, metadata = {} } = {}) {
  const key = process.env.COHERE_API_KEY;
  if (!key) throw new Error('COHERE_API_KEY not set in environment');

  const url = 'https://api.cohere.ai/generate'; // official endpoint

  try {
    const res = await axios.post(url, {
      model: 'command-xlarge',
      prompt,
      max_tokens: Number(process.env.AI_MAX_TOKENS) || 512
    }, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      timeout: 60_000
    });

    const text = res.data?.generations?.[0]?.text || String(res.data);
    const usage = res.data?.usage || null;
    return { text, raw: res.data, usage };
  } catch (err) {
    throw err;
  }
}

module.exports = { getCohereResponse };
