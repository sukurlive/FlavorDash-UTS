import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { User } from '../types/product';

// Ganti dengan IP laptop Anda
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

export { getItem, setItem, removeItem, API_URL };

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadAuth();
  }, []);

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
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Load auth error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
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
        
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Network error' };
    }
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
        
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'Login failed' };
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
  };

  const getAuthHeader = () => ({ Authorization: `Bearer ${accessToken}` });

  return { 
    accessToken, 
    refreshToken, 
    user, 
    loading, 
    register, 
    login, 
    logout, 
    getAuthHeader,
    isAuthenticated
  };
}