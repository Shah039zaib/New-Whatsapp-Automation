// ai/providers/gemini.js
const axios = require('axios');

async function getGeminiResponse({ prompt, context = null, metadata = {} } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set in environment');

  // Placeholder URL - replace with official Google Gemini API endpoint & auth method
  const url = 'https://gemini.googleapis.com/v1/generate';

  try {
    const res = await axios.post(url, {
      model: 'gemini-mini',
      prompt,
      context
    }, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      timeout: 60_000
    });

    const text = res.data?.text || (Array.isArray(res.data?.candidates) ? res.data.candidates.map(c => c.text).join('\n') : String(res.data));
    const usage = res.data?.usage || null;
    return { text, raw: res.data, usage };
  } catch (err) {
    throw err;
  }
}

module.exports = { getGeminiResponse };
