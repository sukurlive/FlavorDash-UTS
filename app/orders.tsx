import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../context/AuthContext';

export default function OrdersScreen() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    const token = await getStorageItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="lock" size={64} color="#888" />
        <Text style={styles.emptyText}>Login Diperlukan</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Login Sekarang</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat pesanan...</Text>
      </SafeAreaView>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="receipt" size={64} color="#888" />
        <Text style={styles.emptyText}>Belum Ada Pesanan</Text>
        <Text style={styles.emptySubText}>Belum ada pesanan yang Anda buat</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
          <Text style={styles.shopButtonText}>Mulai Belanja</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.orderCard}
            onPress={() => router.push(`/detail/${item.id}`)}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>{item.order_number}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#FFF3E0' : '#E8F5E9' }]}>
                <Text style={[styles.statusText, { color: item.status === 'pending' ? '#FF9800' : '#4CAF50' }]}>
                  {item.status === 'pending' ? 'Menunggu' : 'Selesai'}
                </Text>
              </View>
            </View>
            <View style={styles.orderDetail}>
              <Text style={styles.orderDate}>
                {new Date(item.created_at).toLocaleDateString('id-ID')}
              </Text>
              <Text style={styles.orderTotal}>Rp {item.total_amount.toLocaleString()}</Text>
            </View>
            <Text style={styles.orderItems}>{item.item_count} item</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16 },
  orderCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNumber: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '600' },
  orderDetail: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderDate: { fontSize: 12, color: '#888' },
  orderTotal: { fontSize: 14, fontWeight: 'bold', color: '#4CAF50' },
  orderItems: { fontSize: 12, color: '#888' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#888', marginTop: 16, marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
  loginButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 25 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  shopButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25, marginTop: 16 },
  shopButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
});