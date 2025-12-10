'use client';
import { useState } from 'react';
import API from '../services/api';

export default function ChatWindow({ selected }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  if (!selected) return <div className="bg-white p-4 rounded shadow">Select a conversation</div>;

  async function send() {
    if (!text) return;
    setSending(true);
    try {
      await API.post('/whatsapp/send-text', { jid: selected.message.remoteJid, text });
      setText('');
    } catch (e) {
      alert('Send failed');
    } finally { setSending(false); }
  }

  return (
    <div className="bg-white p-4 rounded shadow h-[70vh] flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="mb-2 text-sm text-gray-600">Chat with: {selected.message.remoteJid}</div>
        {/* For demo we only show last message */}
        <div className="p-2 bg-gray-100 rounded">{selected.message.text}</div>
      </div>

      <div className="mt-3 flex gap-2">
        <input className="flex-1 p-2 border rounded" value={text} onChange={e=>setText(e.target.value)} />
        <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded" disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
      </div>
    </div>
  );
}
