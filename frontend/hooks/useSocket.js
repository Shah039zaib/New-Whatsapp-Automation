'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket(channel = '/') {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const s = io(url, { path: '/socket.io' }); // default path, adapt if different
    socketRef.current = s;

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    const onMessage = (data) => {
      setEvents(prev => [data, ...prev].slice(0, 200));
    };
    s.on('wa:message', onMessage);
    s.on('wa:media', onMessage);

    return () => {
      s.off('wa:message', onMessage);
      s.disconnect();
    };
  }, [channel]);

  return { socket: socketRef.current, connected, events };
}
