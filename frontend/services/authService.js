import API from './api';

export async function login(email, password) {
  const res = await API.post('/auth/login', { email, password });
  if (res.data?.ok) {
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  }
  throw new Error('Login failed');
}

export function getLocalUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

export function clear() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
