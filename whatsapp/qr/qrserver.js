// whatsapp/qr/qrServer.js
// Simple QR socket: attach to an existing http.Server (e.g., backend server)
// Emits 'qr' events with { accountId, qr } to connected web clients via socket.io

const socketIo = require('socket.io');

let io = null;

function attachQrSocket(httpServer, { path = process.env.WA_QR_SOCKET_PATH || '/wa-qr' } = {}) {
  if (io) return io;
  io = new socketIo.Server(httpServer, {
    path,
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('QR client connected', socket.id);
    socket.on('subscribe', (data) => {
      // data: { accountId }
      socket.join(`qr:${data?.accountId || 'global'}`);
    });
    socket.on('disconnect', () => {});
  });

  return io;
}

function emitQrEvent(accountId, qrData) {
  if (!io) return;
  // qrData: { qr, timeout }
  io.to(`qr:${accountId}`).emit('qr', { accountId, qr: qrData });
  io.to('qr:global').emit('qr', { accountId, qr: qrData });
}

module.exports = { attachQrSocket, emitQrEvent };
