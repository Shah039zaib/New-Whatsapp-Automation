// whatsapp/utils/whatsappErrorHandler.js
function normalizeError(err) {
  const out = new Error();
  out.name = err?.name || 'WAError';
  out.message = err?.message || String(err);
  out.code = err?.code || (err?.output?.statusCode || 'WA_RUNTIME');
  out.details = err?.response?.data || err;
  return out;
}

module.exports = { normalizeError };
