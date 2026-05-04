import api from './api';

// Login with real backend
export const loginUser = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  const { user, access_token } = res.data;
  
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', access_token);
  
  return res.data;
};

// Register with real backend
export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  const { user, access_token } = res.data;
  
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', access_token);
  
  return res.data;
};

// Get user from localStorage
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

// Get token
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Logout
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};