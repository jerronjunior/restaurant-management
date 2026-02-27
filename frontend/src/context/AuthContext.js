import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      return data.errors[0].msg || fallback;
    }
    return data?.message || data?.error || fallback;
  };

  // Set token in axios headers and localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Fetch current user
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Login failed')
      };
    }
  };

  // Admin login function
  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Admin login failed')
      };
    }
  };

  // Register function (without auto-login)
  const register = async (name, email, password, role = 'user') => {
    try {
      await api.post('/auth/register', { name, email, password, role });
      // Don't set token or user - require manual login
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error, 'Registration failed')
      };
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    adminLogin,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
