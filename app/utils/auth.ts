import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

const JWT_SECRET = 'V1S0E_L0CK_2026_S3CR3T'; // Sebaiknya simpan di c.env.JWT_SECRET nanti

export const createToken = async (payload: any) => {
  return await sign({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, JWT_SECRET, 'HS256');
};

export const verifyToken = async (token: string) => {
  try {
    return await verify(token, JWT_SECRET, 'HS256');
  } catch (e) {
    return null;
  }
};

export const setAuthCookie = (c: any, token: string) => {
  setCookie(c, 'auth_token', token, { path: '/', httpOnly: true, secure: true, maxAge: 60 * 60 * 24 * 7 });
};

export const getAuthUser = async (c: any) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return null;
  return await verifyToken(token);
};

export const logoutUser = (c: any) => {
  deleteCookie(c, 'auth_token', { path: '/' });
};

// Fungsi Hashing Sederhana (Gunakan bcrypt di production jika memungkinkan)
export const hashPassword = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};