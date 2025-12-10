// backend/src/utils/apiResponse.js
function ok(res, data = {}, status = 200) {
  return res.status(status).json({ ok: true, ...data });
}
function error(res, message = 'Server error', status = 500, extra = {}) {
  return res.status(status).json({ ok: false, message, ...extra });
}
function notFound(res, message = 'Not found') {
  return res.status(404).json({ ok: false, message });
}
module.exports = { ok, error, notFound };
