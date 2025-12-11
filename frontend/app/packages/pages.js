'use client';
import { useEffect, useState } from 'react';
import API from '../../services/api';
import Link from 'next/link';
import ProtectedRouteClient from '../../components/ProtectedRouteClient';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    API.get('/packages').then(r => {
      if (r.data?.ok) setPackages(r.data.rows || []);
    }).catch(()=>{});
  }, []);

  return (
    <ProtectedRouteClient>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Service Packages</h2>
          <Link href="/packages/new" className="px-3 py-2 bg-blue-600 text-white rounded">Create Package</Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {packages.map(p => (
            <div key={p.id} className="p-4 bg-white rounded shadow">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600">Price: {p.currency} {p.price}</div>
              <div className="text-xs text-gray-500 mt-2">Delivery: {p.delivery_days} days • Revisions: {p.revisions}</div>
              <div className="mt-3">
                <Link href={`/packages/${p.id}`} className="px-3 py-1 bg-gray-200 rounded">View / Edit</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRouteClient>
  );
}
