"use client";
import { useEffect, useState } from "react";
import API from "../../services/api";
import Link from "next/link";
import ProtectedRouteClient from "../../components/ProtectedRouteClient";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get("/orders").then(r => {
      if (r.data?.ok) setOrders(r.data.rows || []);
    }).catch(() => {});
  }, []);

  return (
    <ProtectedRouteClient>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">Orders</h2>
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="p-3 border rounded bg-white flex justify-between items-center">
              <div>
                <div className="font-medium">Order #{o.id} — {o.status}</div>
                <div className="text-xs text-gray-500">Total: {o.total} — Created: {new Date(o.created_at).toLocaleString()}</div>
              </div>
              <Link href={`/orders/${o.id}`} className="px-3 py-1 bg-blue-600 text-white rounded">View</Link>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRouteClient>
  );
}
