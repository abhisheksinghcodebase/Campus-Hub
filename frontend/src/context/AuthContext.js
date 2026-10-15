import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api/authApi';

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // true while we check existing session

  /**
   * Fetch the user's profile from the server.
   * Called on mount if a token exists, and after login/register.
   */
  const fetchUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await getProfile();
      setUser(data.user);
    } catch {
      // Token is invalid / expired — clear everything
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /** Called after successful login or register */
  const saveSession = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  /** Refresh user data (e.g., after profile update) */
  const refreshUser = async () => {
    try {
      const data = await getProfile();
      setUser(data.user);
    } catch (err) {
      console.error('Could not refresh user:', err.message);
    }
  };

  /** Clear session */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, saveSession, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
