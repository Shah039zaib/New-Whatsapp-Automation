// ai/utils/languageDetect.js
// Lightweight language detector using regex heuristics (fast fallback).
function detectLanguage(text) {
  if (!text) return 'en';
  const arabic = /[\u0600-\u06FF]/;
  const cjk = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;
  if (arabic.test(text)) return 'ar';
  if (cjk.test(text)) return 'zh';
  // check some common words for Urdu/Hindi
  if (/\b(ka|ke|hai|kya|nahi|shukriya|bhai)\b/i.test(text)) return 'ur';
  return 'en';
}

module.exports = { detectLanguage };
