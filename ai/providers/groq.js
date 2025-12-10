// ai/providers/groq.js
const axios = require('axios');

async function getGroqResponse({ prompt, context = null, metadata = {} } = {}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set in environment');

  const url = 'https://api.groq.ai/v1/generate'; // placeholder

  try {
    const res = await axios.post(url, { prompt, context }, {
      headers: { Authorization: `Bearer ${key}` },
      timeout: 60_000
    });

    const text = res.data?.result || res.data?.output || String(res.data);
    const usage = res.data?.usage || null;
    return { text, raw: res.data, usage };
  } catch (err) {
    throw err;
  }
}

module.exports = { getGroqResponse };
