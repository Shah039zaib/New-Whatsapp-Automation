// frontend/pages/login.js
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password: pass });
      alert('Login success (mock). Token: ' + (res.data?.token || 'none'));
    } catch (err) {
      alert('Login failed');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div><input placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} /></div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
