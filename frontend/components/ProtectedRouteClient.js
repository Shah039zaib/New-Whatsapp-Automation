'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRouteClient({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      // not logged in, go to login
      router.replace('/login');
    }
  }, [user, router]);

  if (!user) return null;
  return children;
}
