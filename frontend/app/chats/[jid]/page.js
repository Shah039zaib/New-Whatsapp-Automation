"use client";
import { useEffect, useState } from "react";
import API from "../../../services/api";

export default function ChatDetail({ params }) {
  const jid = decodeURIComponent(params.jid);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    API.get(`/chats/${encodeURIComponent(jid)}/messages`)
      .then((r) => {
        if (r.data?.ok) setMessages(r.data.messages);
      })
      .catch(() => {});
  }, [jid]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{jid}</h2>
      <div className="space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded ${
              m.direction === "inbound" ? "bg-gray-100" : "bg-blue-100"
            }`}
          >
            <div className="text-xs text-gray-600">
              {m.sender} — {new Date(Number(m.ts)).toLocaleString()}
            </div>
            <div>{m.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
