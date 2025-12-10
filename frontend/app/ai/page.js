'use client';
import ProtectedRouteClient from '../../components/ProtectedRouteClient';
import { useState } from 'react';
import API from '../../services/api';

export default function AIPage() {
  const [provider, setProvider] = useState('claude');
  const [prompt, setPrompt] = useState('');
  const [resp, setResp] = useState(null);

  async function ask() {
    try {
      const r = await API.post('/ai/ask', { prompt, provider });
      setResp(r.data?.response);
    } catch (e) {
      setResp({ text: 'Error' });
    }
  }

  return (
    <ProtectedRouteClient>
      <div className="bg-white p-4 rounded shadow max-w-3xl">
        <h3 className="font-semibold mb-2">AI Quick Test</h3>
        <div className="mb-2">
          <select value={provider} onChange={e => setProvider(e.target.value)} className="p-2 border rounded">
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="groq">Groq</option>
            <option value="cohere">Cohere</option>
          </select>
        </div>
        <textarea className="w-full p-2 border rounded" rows={4} value={prompt} onChange={e=>setPrompt(e.target.value)} />
        <div className="mt-2">
          <button onClick={ask} className="px-3 py-2 bg-blue-600 text-white rounded">Ask AI</button>
        </div>

        {resp && <div className="mt-4 bg-gray-50 p-3 rounded"><pre>{resp.text}</pre></div>}
      </div>
    </ProtectedRouteClient>
  );
}
