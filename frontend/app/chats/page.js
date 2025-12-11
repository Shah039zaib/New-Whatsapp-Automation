"use client";
import { useEffect, useState } from "react";
import API from "../../services/api";
import Link from "next/link";

export default function ChatsPage() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    API.get("/chats")
      .then((r) => {
        if (r.data?.ok) setChats(r.data.rows);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Conversations</h2>
      <div className="space-y-2">
        {chats.map((c) => (
          <div key={c.jid} className="p-3 border rounded bg-white flex justify-between">
            <div>
              <div className="font-semibold">{c.jid}</div>
              <div className="text-xs text-gray-500">
                {new Date(c.updated_at).toLocaleString()}
              </div>
            </div>
            <Link
              href={`/chats/${encodeURIComponent(c.jid)}`}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
