import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';




















const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.withCredentials = true;
  // We'll set base URL in a global config or env, but for now assumption:
  axios.defaults.baseURL = 'http://localhost:5000'; // Adjust port if needed

  const checkUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await axios.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await axios.post('/auth/verify-otp', { email, otp });
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const resendOtp = async (email) => {
    const res = await axios.post('/auth/resend-otp', { email });
    return res.data;
  };

  const completeProfile = async (formData) => {
    const res = await axios.post('/auth/complete-profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const updateAvatar = async (formData) => {
    const res = await axios.post('/auth/update-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const removeAvatar = async () => {
    const res = await axios.post('/auth/remove-avatar');
    if (res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.get('/auth/logout');
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, resendOtp, completeProfile, updateAvatar, removeAvatar, logout, checkUser }}>
            {children}
        </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};