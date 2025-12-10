'use client';
import ProtectedRouteClient from '../../components/ProtectedRouteClient';
import { useState, useEffect } from 'react';
import API from '../../services/api';

export default function PaymentsPage() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!file) return setMsg('Select file');
    const fd = new FormData();
    fd.append('screenshot', file);
    fd.append('method', 'easypaisa');
    try {
      const res = await API.post('/payment/verify', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data?.ok) setMsg('Uploaded');
    } catch (err) {
      setMsg('Upload failed');
    }
  }

  return (
    <ProtectedRouteClient>
      <div className="bg-white p-4 rounded shadow max-w-md">
        <h3 className="font-semibold mb-3">Upload Payment Screenshot</h3>
        <form onSubmit={submit} className="space-y-3">
          <input type="file" onChange={e => setFile(e.target.files[0])} />
          <button className="px-3 py-2 bg-green-600 text-white rounded">Upload</button>
        </form>
        {msg && <div className="mt-2">{msg}</div>}
      </div>
    </ProtectedRouteClient>
  );
}
