// app/admin/order/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../../../context/AuthContext';
import axios from 'axios';

const STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const STATUS_LABELS: { [key: string]: string } = { 
  pending: 'Menunggu', 
  processing: 'Diproses', 
  completed: 'Selesai', 
  cancelled: 'Dibatalkan' 
};
const STATUS_COLORS: { [key: string]: string } = { 
  pending: '#FF9800', 
  processing: '#2196F3', 
  completed: '#4CAF50', 
  cancelled: '#f44336' 
};

export default function AdminOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchOrderDetail = async () => {
    const token = await getStorageItem('accessToken');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/admin/orders/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setOrder(response.data.order);
      setItems(response.data.items);
    } catch (error: any) {
      Alert.alert('Error', 'Gagal mengambil detail pesanan');
      router.back();
    } finally { 
      setLoading(false); 
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (newStatus === order?.status) return;
    
    Alert.alert(
      'Update Status',
      `Ubah status pesanan dari "${STATUS_LABELS[order?.status]}" menjadi "${STATUS_LABELS[newStatus]}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: async () => {
            setUpdating(true);
            const token = await getStorageItem('accessToken');
            try {
              await axios.put(
                `${API_URL}/api/admin/orders/${id}/status`, 
                { status: newStatus }, 
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Sukses', 'Status pesanan berhasil diupdate');
              fetchOrderDetail();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Gagal update status');
            } finally { 
              setUpdating(false); 
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchOrderDetail();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="lock" size={64} color="#888" />
        <Text style={styles.emptyText}>Akses Admin Diperlukan</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat detail...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="error" size={64} color="#888" />
        <Text style={styles.emptyText}>Pesanan tidak ditemukan</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Informasi Order */}
        <View style={styles.card}>
          <View style={styles.orderNumberContainer}>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
                {STATUS_LABELS[order.status]}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pelanggan:</Text>
            <Text style={styles.infoValue}>{order.user_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{order.user_email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal:</Text>
            <Text style={styles.infoValue}>
              {new Date(order.created_at).toLocaleDateString('id-ID')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.totalAmount}>Rp {order.total_amount.toLocaleString()}</Text>
          </View>
          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Catatan:</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Item Pesanan */}
        <View style={styles.card}>
          <Text style={styles.itemsTitle}>🛒 Item Pesanan</Text>
          {items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>{item.quantity} x Rp {item.price.toLocaleString()}</Text>
              <Text style={styles.itemSubtotal}>= Rp {item.subtotal.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Update Status */}
        {!updating ? (
          <View style={styles.card}>
            <Text style={styles.statusTitle}>Update Status</Text>
            <View style={styles.statusButtons}>
              {STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    order.status === status && styles.statusButtonActive,
                    { borderColor: STATUS_COLORS[status] }
                  ]}
                  onPress={() => updateStatus(status)}
                  disabled={order.status === status}
                >
                  <Text style={[
                    styles.statusButtonText,
                    order.status === status && styles.statusButtonTextActive,
                    { color: order.status === status ? STATUS_COLORS[status] : STATUS_COLORS[status] }
                  ]}>
                    {STATUS_LABELS[status]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.updatingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.updatingText}>Mengupdate status...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/admin/orders')}>
          <Text style={styles.backButtonText}>← Kembali ke Daftar Pesanan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  orderNumberContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  orderNumber: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  notesBox: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8, marginTop: 8 },
  notesLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 },
  notesText: { fontSize: 12, color: '#333' },
  itemsTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  orderItem: { 
    marginBottom: 8, 
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0' 
  },
  itemName: { fontSize: 14, fontWeight: '500' },
  itemDetail: { fontSize: 12, color: '#888' },
  itemSubtotal: { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
  statusTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    borderWidth: 2, 
    marginBottom: 8 
  },
  statusButtonActive: { backgroundColor: '#E8F5E9' },
  statusButtonText: { fontSize: 12, fontWeight: '600' },
  statusButtonTextActive: { color: '#4CAF50' },
  backButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 16 
  },
  backButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    padding: 24 
  },
  emptyText: { fontSize: 16, color: '#888', marginTop: 12 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
  updatingContainer: { alignItems: 'center', padding: 20 },
  updatingText: { marginTop: 12, fontSize: 14, color: '#888' },
});