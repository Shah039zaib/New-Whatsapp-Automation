'use client';
import { useEffect, useState } from 'react';
import API from '../../../services/api';
import { useRouter } from 'next/navigation';
import ProtectedRouteClient from '../../../components/ProtectedRouteClient';

export default function PackageEdit({ params }) {
  const id = params.id;
  const router = useRouter();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title,setTitle] = useState('');
  const [price,setPrice] = useState('');
  const [delivery,setDelivery] = useState(3);
  const [revisions,setRevisions] = useState(1);
  const [features,setFeatures] = useState('');

  useEffect(() => {
    API.get(`/packages/${id}`).then(r=>{
      if (r.data?.ok) {
        setPkg(r.data.package);
        setTitle(r.data.package.title);
        setPrice(r.data.package.price);
        setDelivery(r.data.package.delivery_days);
        setRevisions(r.data.package.revisions);
        setFeatures((r.data.package.features || []).join('\n'));
      }
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [id]);

  async function save() {
    const featuresArr = features.split('\n').map(s=>s.trim()).filter(Boolean);
    await API.put(`/packages/${id}`, { title, price: Number(price||0), delivery_days: Number(delivery), revisions: Number(revisions), features: JSON.stringify(featuresArr) });
    router.refresh();
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <ProtectedRouteClient>
      <div className="p-4 max-w-2xl bg-white rounded shadow">
        <h3 className="font-semibold mb-3">Edit Package #{id}</h3>
        <div className="space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded" />
          <input value={price} onChange={e=>setPrice(e.target.value)} className="w-full p-2 border rounded" />
          <input value={delivery} onChange={e=>setDelivery(e.target.value)} className="w-full p-2 border rounded" />
          <input value={revisions} onChange={e=>setRevisions(e.target.value)} className="w-full p-2 border rounded" />
          <textarea value={features} onChange={e=>setFeatures(e.target.value)} className="w-full p-2 border rounded" rows={6} />
          <div className="mt-2">
            <button onClick={save} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </ProtectedRouteClient>
  );
}
