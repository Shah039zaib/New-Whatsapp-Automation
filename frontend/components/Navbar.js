'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow p-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="logo" className="w-10 h-10" />
          <Link href="/" className="font-semibold">Shopify WA Admin</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/conversations">Conversations</Link>
          <Link href="/payments">Payments</Link>
          <Link href="/ai">AI</Link>
          <Link href="/whatsapp/qr">QR</Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{user.name || user.email}</span>
              <button onClick={() => { logout(); router.push('/login'); }} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="px-3 py-1 bg-blue-600 text-white rounded">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
