import { createContext, useContext, useMemo, useState } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser')) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const saveSession = ({ user: authUser, token, expiry }) => {
    if (!token) throw new Error('Token was not found in response headers. Check CORS exposed headers.');
    localStorage.setItem('accessToken', token);
    if (expiry) localStorage.setItem('tokenExpiresAt', expiry);
    localStorage.setItem('currentUser', JSON.stringify(authUser));
    setUser(authUser);
  };

  const login = async (payload) => saveSession(await authApi.login(payload));
  const register = async (payload) => saveSession(await authApi.register(payload));
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout, isAdmin: user?.role === 'Admin' }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
