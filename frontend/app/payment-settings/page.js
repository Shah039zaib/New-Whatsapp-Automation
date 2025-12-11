"use client";
import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function PaymentSettingsPage() {
  const [form, setForm] = useState({
    easypaisa_name:"",
    easypaisa_number:"",
    jazzcash_name:"",
    jazzcash_number:"",
    bank_title:"",
    bank_account:"",
    bank_iban:""
  });

  const load = async () => {
    const res = await axios.get('/api/payment-settings');
    if (res.data.settings) setForm(res.data.settings);
  };

  const save = async () => {
    await axios.put('/api/payment-settings', form);
    alert("Payment settings updated!");
  };

  useEffect(()=>{ load(); },[]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Payment Settings</h1>

      <div className="grid grid-cols-2 gap-4">
        <input className="border p-2" placeholder="EasyPaisa Name"
          value={form.easypaisa_name}
          onChange={e=>setForm({...form, easypaisa_name:e.target.value})}
        />
        <input className="border p-2" placeholder="EasyPaisa Number"
          value={form.easypaisa_number}
          onChange={e=>setForm({...form, easypaisa_number:e.target.value})}
        />

        <input className="border p-2" placeholder="JazzCash Name"
          value={form.jazzcash_name}
          onChange={e=>setForm({...form, jazzcash_name:e.target.value})}
        />
        <input className="border p-2" placeholder="JazzCash Number"
          value={form.jazzcash_number}
          onChange={e=>setForm({...form, jazzcash_number:e.target.value})}
        />

        <input className="border p-2" placeholder="Bank Title"
          value={form.bank_title}
          onChange={e=>setForm({...form, bank_title:e.target.value})}
        />
        <input className="border p-2" placeholder="Bank Account"
          value={form.bank_account}
          onChange={e=>setForm({...form, bank_account:e.target.value})}
        />

        <input className="border p-2 col-span-2" placeholder="Bank IBAN"
          value={form.bank_iban}
          onChange={e=>setForm({...form, bank_iban:e.target.value})}
        />
      </div>

      <button className="bg-blue-600 text-white px-4 py-2" onClick={save}>
        Save
      </button>
    </div>
  );
}
