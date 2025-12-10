'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function QRPage() {
  const [qr, setQr] = useState(null);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const s = io(url, { path: '/wa-qr' });
    s.emit('subscribe', { accountId: 'main' });
    s.on('qr', (data) => {
      setQr(data.qr);
    });
    return () => s.disconnect();
  }, []);

  function renderQr(q) {
    // Baileys QR often base64 data or string. If it's raw text, you can use 'qrcode' lib to render.
    if (!q) return null;
    try {
      // if base64 image data URI
      if (q.startsWith('data:image')) return <img src={q} alt="qr"/>;
    } catch {}
    return <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded">{q}</pre>;
  }

  return (
    <div className="bg-white p-4 rounded shadow max-w-xl">
      <h3 className="font-semibold mb-3">WhatsApp QR (scan with WhatsApp)</h3>
      {qr ? renderQr(qr) : <div>No QR yet. Make sure WA manager running.</div>}
    </div>
  );
}
