import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('servex_token') || null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('servex_token');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for 401 from api interceptor
  useEffect(() => {
    const onUnauthorized = () => handleLogout();
    window.addEventListener('servex:unauthorized', onUnauthorized);
    return () => window.removeEventListener('servex:unauthorized', onUnauthorized);
  }, [handleLogout]);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            // Backend returns user data in res.data.data
            setUser(res.data.data || res.data.user);
          } else {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('servex_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}! 👋`);
        return { success: true, role: res.data.user.role };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        localStorage.setItem('servex_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Account created! Welcome to ServeX 🎉');
        return { success: true, role: res.data.user.role };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    handleLogout();
    toast.info('Logged out successfully. See you soon!');
  };

  const setAuthSession = (userData, jwtToken) => {
    localStorage.setItem('servex_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setAuthSession }}>
      {children}
    </AuthContext.Provider>
  );
};
