'use client';
import { useEffect, useState } from 'react';
import API from '../services/api';
import ProtectedRouteClient from '../components/ProtectedRouteClient';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let mounted = true;
    API.get('/analytics/overview').then(r => {
      if (mounted && r.data?.ok) setOverview(r.data);
    }).catch(e => {});
    return () => { mounted = false; };
  }, []);

  return (
    <ProtectedRouteClient>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Welcome, {user?.name || user?.email}</h3>
          <p className="text-sm text-gray-500">Dashboard overview</p>
          <div className="mt-4">
            {overview ? (
              <div className="space-y-2">
                <div>Conversations: {overview.conversations}</div>
                <div>Orders: {overview.sales?.orders || 0}</div>
                <div>Revenue: {overview.sales?.revenue || 0}</div>
              </div>
            ) : (
              <div>Loading overview...</div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold">Quick Actions</h4>
          <div className="mt-2 space-y-2">
            <a href="/conversations" className="block px-3 py-2 bg-blue-50 rounded">Open Conversations</a>
            <a href="/payments" className="block px-3 py-2 bg-blue-50 rounded">Payments</a>
            <a href="/whatsapp/qr" className="block px-3 py-2 bg-blue-50 rounded">WhatsApp QR</a>
          </div>
        </div>
      </div>
    </ProtectedRouteClient>
  );
}
