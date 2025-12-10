'use client';
import React, { createContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = authService.getLocalUser();
    if (u) setUser(u);
  }, []);

  async function login(email, password) {
    const res = await authService.login(email, password);
    setUser(res.user);
    return res;
  }

  function logout() {
    authService.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
