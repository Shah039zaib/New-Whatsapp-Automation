'use client';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthWrapper({ children }) {
  // convenience default wrapper if needed
  return children;
}
