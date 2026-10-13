import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('labelmitra_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user data on boot if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const [meRes, profileRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/profile'),
        ]);

        setUser(meRes.data.data);
        setProfileData(profileRes.data.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;

    localStorage.setItem('labelmitra_token', newToken);
    setToken(newToken);
    setUser(userData);

    // Refresh full profile data
    const profileRes = await api.get('/profile');
    setProfileData(profileRes.data.data);

    return userData;
  };

  const register = async ({ email, password, fullName, dietaryPreference }) => {
    const res = await api.post('/auth/register', {
      email,
      password,
      fullName,
      dietaryPreference,
    });
    const { token: newToken, user: userData } = res.data.data;

    localStorage.setItem('labelmitra_token', newToken);
    setToken(newToken);
    setUser(userData);

    // Fetch initialized profile
    const profileRes = await api.get('/profile');
    setProfileData(profileRes.data.data);

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('labelmitra_token');
    setToken(null);
    setUser(null);
    setProfileData(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.get('/profile');
      setProfileData(res.data.data);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profileData,
        token,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
