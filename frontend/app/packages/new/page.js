'use client';
import { useState } from 'react';
import API from '../../../services/api';
import { useRouter } from 'next/navigation';
import ProtectedRouteClient from '../../../components/ProtectedRouteClient';

export default function CreatePackage() {
  const router = useRouter();
  const [title,setTitle] = useState('');
  const [price,setPrice] = useState('');
  const [delivery,setDelivery] = useState(3);
  const [revisions,setRevisions] = useState(1);
  const [features,setFeatures] = useState('');
  const [loading,setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const featuresArr = features.split('\n').map(s=>s.trim()).filter(Boolean);
      await API.post('/packages', { title, price: Number(price||0), delivery_days: Number(delivery), revisions: Number(revisions), features: JSON.stringify(featuresArr) });
      router.push('/packages');
    } catch (err) {
      alert('Create failed');
    } finally { setLoading(false); }
  }

  return (
    <ProtectedRouteClient>
      <div className="p-4 max-w-lg bg-white rounded shadow">
        <h3 className="font-semibold mb-3">Create Package</h3>
        <form onSubmit={submit} className="space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
          <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="w-full p-2 border rounded" />
          <input value={delivery} onChange={e=>setDelivery(e.target.value)} placeholder="Delivery days" className="w-full p-2 border rounded" />
          <input value={revisions} onChange={e=>setRevisions(e.target.value)} placeholder="Revisions" className="w-full p-2 border rounded" />
          <textarea value={features} onChange={e=>setFeatures(e.target.value)} placeholder="Features (one per line)" className="w-full p-2 border rounded" rows={6} />
          <div>
            <button className="px-3 py-2 bg-green-600 text-white rounded" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </ProtectedRouteClient>
  );
}
