import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User } from '../types/product';

const API_URL = 'http://192.168.100.2:3000';

const setItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getItem = async (key: string) => {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const removeItem = async (key: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  cartCount: number;
  refreshCartCount: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    loadAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshCartCount();
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const loadAuth = async () => {
    try {
      const storedAccess = await getItem('accessToken');
      const storedRefresh = await getItem('refreshToken');
      const storedUser = await getItem('userData');
      
      if (storedAccess && storedRefresh && storedUser) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Load auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCartCount = async () => {
    const token = await getItem('accessToken');
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartCount(response.data.itemCount || 0);
    } catch (error) {
      console.error('Refresh cart count error:', error);
      setCartCount(0);
    }
  };

  const getToken = async () => {
    return await getItem('accessToken');
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/login`, { email, password });
      if (response.data.success) {
        await setItem('accessToken', response.data.accessToken);
        await setItem('refreshToken', response.data.refreshToken);
        await setItem('userData', JSON.stringify(response.data.user));
        
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        await refreshCartCount();
        
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Network error' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/register`, { name, email, password });
      if (response.data.success) {
        await setItem('accessToken', response.data.accessToken);
        await setItem('refreshToken', response.data.refreshToken);
        await setItem('userData', JSON.stringify(response.data.user));
        
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        await refreshCartCount();
        
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Network error' };
    }
  };

  const logout = async () => {
    if (refreshToken && accessToken) {
      try {
        await axios.post(`${API_URL}/api/logout`, 
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    await removeItem('accessToken');
    await removeItem('refreshToken');
    await removeItem('userData');
    
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setCartCount(0);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      accessToken,
      loading,
      cartCount,
      refreshCartCount,
      login,
      register,
      logout,
      getToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { API_URL, getItem as getStorageItem, setItem as setStorageItem };