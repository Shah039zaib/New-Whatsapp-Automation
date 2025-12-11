"use client";
import { useEffect, useState } from "react";
import API from "../../../services/api";
import ProtectedRouteClient from "../../../components/ProtectedRouteClient";
import { useRouter } from "next/navigation";

export default function OrderDetail({ params }) {
  const id = params.id;
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('');
  const router = useRouter();

  useEffect(() => {
    API.get(`/orders/${id}`).then(r => {
      if (r.data?.ok) setData(r.data);
    }).catch(()=>{});
  }, [id]);

  async function changeStatus() {
    if (!status) return;
    await API.post(`/orders/${id}/status`, { status, note: 'Updated by admin' });
    // reload
    const r = await API.get(`/orders/${id}`);
    if (r.data?.ok) setData(r.data);
  }

  if (!data) return <div className="p-4">Loading...</div>;

  const { order, items } = data;

  return (
    <ProtectedRouteClient>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">Order #{order.id}</h2>
        <div className="mb-4">
          <div>Status: <strong>{order.status}</strong></div>
          <div>Total: {order.total}</div>
          <div>Chat ID: {order.chat_id}</div>
        </div>

        <div className="mb-4 bg-white p-3 rounded">
          <h3 className="font-semibold mb-2">Items</h3>
          <ul>
            {items.map(it => (
              <li key={it.id} className="border-b py-2">
                {it.title} — {it.quantity} × {it.unit_price}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <select value={status} onChange={e=>setStatus(e.target.value)} className="p-2 border rounded">
            <option value="">Change status</option>
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="shipped">shipped</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button onClick={changeStatus} className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Update</button>
        </div>
      </div>
    </ProtectedRouteClient>
  );
}
