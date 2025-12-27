import { cookies } from 'next/headers'
import jwt_decode from 'jwt-decode'

export function getJwt(): string | null {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('jwt');
  }
  return null;
}

export function setJwt(token: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('jwt', token);
  }
}

export function clearJwt() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('jwt');
  }
}

export function parseJwt(token: string): any {
  try {
    return jwt_decode(token);
  } catch {
    return null;
  }
}

export function isDietitian(token: string | null): boolean {
  if (!token) return false;
  const payload = parseJwt(token);
  return payload?.role === 'Dietitian';
}

export function isClient(token: string | null): boolean {
  if (!token) return false;
  const payload = parseJwt(token);
  return payload?.role === 'Client';
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = window.localStorage.getItem('jwt');
  return !!token && (isDietitian(token) || isClient(token));
}



