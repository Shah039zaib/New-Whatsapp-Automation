'use client';
import useSocket from '../../hooks/useSocket';
import ConversationList from '../../components/ConversationList';
import ChatWindow from '../../components/ChatWindow';
import ProtectedRouteClient from '../../components/ProtectedRouteClient';
import { useState } from 'react';

export default function ConversationsPage() {
  const { connected, events } = useSocket();
  const [selected, setSelected] = useState(null);

  return (
    <ProtectedRouteClient>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="mb-2 text-sm">Socket: {connected ? 'Connected' : 'Disconnected'}</div>
          <ConversationList items={events} onSelect={setSelected} />
        </div>
        <div className="col-span-2">
          <ChatWindow selected={selected} />
        </div>
      </div>
    </ProtectedRouteClient>
  );
}
