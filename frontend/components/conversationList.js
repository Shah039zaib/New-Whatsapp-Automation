'use client';
import React from 'react';

export default function ConversationList({ items = [], onSelect }) {
  return (
    <div className="bg-white rounded shadow p-2 h-[70vh] overflow-auto">
      <h4 className="font-semibold mb-2">Recent Messages</h4>
      {items.length === 0 && <div className="text-sm text-gray-500">No messages yet</div>}
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={idx} className="p-2 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => onSelect(it)}>
            <div className="text-sm font-medium">{it?.message?.remoteJid}</div>
            <div className="text-xs text-gray-600">{it?.message?.text?.slice(0, 80)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
