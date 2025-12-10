// ai/utils/aiErrorHandler.js
function aiErrorHandler(err) {
  // Normalize to Error with message and code
  const out = new Error();
  out.name = 'AIError';

  if (!err) {
    out.message = 'Unknown AI error';
    out.code = 'AI_UNKNOWN';
    return out;
  }

  // Axios network error
  if (err.isAxiosError) {
    const status = err.response?.status;
    const data = err.response?.data;
    out.message = `AI provider network error${status ? ' status:' + status : ''}`;
    out.details = data || err.message;
    out.code = status ? `HTTP_${status}` : 'AI_NETWORK';
    return out;
  }

  // Custom or string error
  out.message = err.message || String(err);
  out.code = err.code || 'AI_RUNTIME';
  out.details = err;
  return out;
}

module.exports = { aiErrorHandler };
