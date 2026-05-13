import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../../context/AuthContext';
import axios from 'axios';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => { 
    if (isAuthenticated && id) fetchOrderDetail(); 
  }, [isAuthenticated, id]);

  const fetchOrderDetail = async () => {
    const token = await getStorageItem('accessToken');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/orders/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setOrder(response.data.order);
      setItems(response.data.items);
    } catch (error) { 
      console.error('Fetch order detail error:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (loading) return (
    <SafeAreaView style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>Memuat detail...</Text>
    </SafeAreaView>
  );

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Menunggu';
      case 'processing': return 'Diproses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#888';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Icon name="receipt" size={50} color="#4CAF50" style={styles.icon} />
          <Text style={styles.orderNumber}>{order?.order_number}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order?.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order?.status) }]}>{getStatusText(order?.status)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal:</Text>
            <Text style={styles.infoValue}>{order?.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.totalAmount}>Rp {order?.total_amount?.toLocaleString() || 0}</Text>
          </View>

          {items.length > 0 && (
            <View style={styles.itemsBox}>
              <Text style={styles.itemsTitle}>Item Pesanan:</Text>
              {items.map((item, idx) => (
                <View key={idx} style={styles.orderItem}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetail}>{item.quantity} x Rp {item.price.toLocaleString()}</Text>
                  <Text style={styles.itemSubtotal}>= Rp {item.subtotal.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Icon name="arrow-back" size={16} color="#FFF" />
            <Text style={styles.backButtonText}> Kembali ke Katalog</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  icon: { alignSelf: 'center', marginBottom: 16 },
  orderNumber: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 14, color: '#666' }, infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, statusText: { fontSize: 12, fontWeight: '600' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  itemsBox: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, marginTop: 16, marginBottom: 20 },
  itemsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  orderItem: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  itemName: { fontSize: 14, fontWeight: '500' }, itemDetail: { fontSize: 12, color: '#888' }, itemSubtotal: { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
  backButton: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center' },
  backButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }, loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
});