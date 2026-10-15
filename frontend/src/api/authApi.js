/**
 * authApi.js — Axios instance + all auth API calls.
 *
 * Every function returns the response data directly so components
 * don't need to dig into response.data themselves.
 */
import axios from 'axios';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from localStorage automatically ───────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: unwrap data, handle 401 globally ───────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Public API functions
// ─────────────────────────────────────────────────────────────────────────────

/** POST /api/auth/register */
export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

/** POST /api/auth/login */
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

/** POST /api/auth/google */
export const googleLoginApi = (credential) =>
  api.post('/auth/google', { credential });

/** GET /api/auth/google-client-id */
export const fetchGoogleClientId = () =>
  api.get('/auth/google-client-id');

/** GET /api/auth/me */
export const getProfile = () => api.get('/auth/me');

/** PUT /api/auth/update-profile */
export const updateProfile = (data) => api.put('/auth/update-profile', data);

/** PUT /api/auth/change-password */
export const changePassword = (currentPassword, newPassword) =>
  api.put('/auth/change-password', { currentPassword, newPassword });

/** POST /api/auth/forgot-password */
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

/** POST /api/auth/reset-password/:token */
export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password });

/** DELETE /api/auth/delete-account */
export const deleteAccount = () => api.delete('/auth/delete-account');

export default api;
