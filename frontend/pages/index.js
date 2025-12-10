// frontend/pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Shopify WA Automation - Admin</h1>
      <p>Frontend skeleton running.</p>
      <p><Link href="/login">Login</Link></p>
    </div>
  );
}
