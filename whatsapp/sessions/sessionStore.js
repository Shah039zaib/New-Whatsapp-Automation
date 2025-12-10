// whatsapp/sessions/sessionStore.js
const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, 'sessions.json');

function loadSessions() {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveSessions(obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

module.exports = { loadSessions, saveSessions };
