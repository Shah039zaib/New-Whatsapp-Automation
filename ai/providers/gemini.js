// ai/providers/gemini.js
const axios = require('axios');

async function getGeminiResponse({ prompt, context = [] }) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  // Template: replace with official call
  const res = await axios.post('https://api.google.example/gemini', { prompt, context }, {
    headers: { Authorization: `Bearer ${key}` }
  });

  return { text: res.data?.text || String(res.data) };
}

module.exports = { getGeminiResponse };
