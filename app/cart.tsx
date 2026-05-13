import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../context/AuthContext';
import { CartItem } from '../types/product';

export default function CartScreen() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const router = useRouter();

  // Auto refresh setiap kali screen focus
  useFocusEffect(
    useCallback(() => {
      console.log('Cart screen focused - auto refreshing...');
      fetchCart();
    }, [])
  );

  // Auto refresh setiap 5 detik (optional)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAuthenticated) {
      interval = setInterval(() => {
        console.log('Auto refresh cart...');
        fetchCart();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchCart = async () => {
    const token = await getStorageItem('accessToken');
    if (!token) { 
      setLoading(false); 
      return; 
    }
    try {
      const response = await axios.get(`${API_URL}/api/cart`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setCart(response.data.cart || []);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Sesi Habis', 'Silakan login kembali', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
      }
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    const token = await getStorageItem('accessToken');
    if (!token) return;
    try {
      await axios.put(`${API_URL}/api/cart/update`, 
        { productId, quantity }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) { 
      Alert.alert('Error', 'Gagal mengupdate jumlah'); 
    }
  };

  const removeItem = async (productId: number, productName: string) => {
    Alert.alert('Hapus Item', `Hapus ${productName} dari keranjang?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
          const token = await getStorageItem('accessToken');
          if (!token) { 
            Alert.alert('Error', 'Silakan login kembali'); 
            return; 
          }
          try {
            await axios({ 
              method: 'delete', 
              url: `${API_URL}/api/cart/remove`, 
              data: { productId }, 
              headers: { Authorization: `Bearer ${token}` } 
            });
            await fetchCart();
            Alert.alert('Berhasil', `${productName} dihapus dari keranjang`);
          } catch (error) { 
            Alert.alert('Error', 'Gagal menghapus item'); 
          }
        }
      }
    ]);
  };

  const processCheckout = async (paymentMethod: string) => {
    setShowPaymentModal(false);
    setCheckoutLoading(true);
    
    const token = await getStorageItem('accessToken');
    if (!token) {
      Alert.alert('Login Diperlukan', 'Silakan login untuk checkout');
      setCheckoutLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/checkout`, 
        { paymentMethod, notes: '' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        Alert.alert(
          '🎉 Terima Kasih!',
          `Order #${response.data.order.orderNumber}\nTotal: Rp ${response.data.order.totalAmount.toLocaleString()}\n\nPesanan akan segera dikirim!`,
          [{ text: 'OK', onPress: () => router.push('/products') }]
        );
        await fetchCart();
      }
    } catch (error: any) {
      Alert.alert('Checkout Gagal', error.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const showPaymentOptions = () => {
    if (cart.length === 0) {
      Alert.alert('Keranjang Kosong', 'Tidak ada item untuk di-checkout');
      return;
    }
    setShowPaymentModal(true);
  };

  const onRefresh = () => { 
    setRefreshing(true); 
    fetchCart(); 
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat keranjang...</Text>
      </View>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="lock" size={64} color="#888" />
        <Text style={styles.emptyText}>Login Diperlukan</Text>
        <Text style={styles.emptySubText}>Silakan login untuk melihat keranjang belanja</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/login')}>
          <Text style={styles.shopButtonText}>Login Sekarang</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (cart.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="remove-shopping-cart" size={64} color="#888" />
        <Text style={styles.emptyText}>Keranjang Kosong</Text>
        <Text style={styles.emptySubText}>Belum ada produk di keranjang Anda</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/products')}>
          <Text style={styles.shopButtonText}>Mulai Belanja</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modal Pilihan Pembayaran */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Metode Pembayaran</Text>
            <TouchableOpacity style={styles.paymentOption} onPress={() => processCheckout('transfer')}>
              <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
              <Text style={styles.paymentText}>Transfer Bank</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentOption} onPress={() => processCheckout('cod')}>
              <Icon name="local-shipping" size={24} color="#4CAF50" />
              <Text style={styles.paymentText}>COD (Bayar di Tempat)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header dengan informasi jumlah item */}
      <View style={styles.headerInfo}>
        <Text style={styles.headerInfoText}>
          {cart.length} item ({total.toLocaleString()})
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={20} color="#4CAF50" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.product?.name}</Text>
              <TouchableOpacity onPress={() => removeItem(item.productId, item.product?.name || 'item')}>
                <Icon name="delete-outline" size={22} color="#ff4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemPrice}>Rp {(item.product?.price || 0).toLocaleString()}</Text>
            <View style={styles.itemActions}>
              <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.productId, item.quantity - 1)}>
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item.productId, item.quantity + 1)}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtotal}>Subtotal: Rp {item.subtotal.toLocaleString()}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>Rp {total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.checkoutButton, checkoutLoading && styles.disabledButton]} 
          onPress={showPaymentOptions} 
          disabled={checkoutLoading}
        >
          <Text style={styles.checkoutButtonText}>{checkoutLoading ? 'Memproses...' : 'Checkout'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerInfoText: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  cartItem: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 16, 
    marginVertical: 6, 
    padding: 12, 
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  itemName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    flex: 1 
  },
  itemPrice: { 
    fontSize: 14, 
    color: '#4CAF50', 
    marginTop: 2, 
    marginBottom: 8 
  },
  itemActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  qtyButton: { 
    width: 36, 
    height: 36, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  qtyButtonText: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  qtyText: { 
    fontSize: 16, 
    marginHorizontal: 16 
  },
  subtotal: { 
    fontSize: 12, 
    color: '#888', 
    textAlign: 'right' 
  },
  footer: { 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0' 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  totalLabel: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  totalAmount: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#4CAF50' 
  },
  checkoutButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  checkoutButtonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  disabledButton: { 
    backgroundColor: '#aaa' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#888' 
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#888', 
    marginBottom: 8, 
    marginTop: 16 
  },
  emptySubText: { 
    fontSize: 14, 
    color: '#888', 
    textAlign: 'center', 
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  shopButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 10, 
    paddingHorizontal: 24, 
    borderRadius: 20, 
    marginTop: 16 
  },
  shopButtonText: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 24, 
    width: '80%', 
    alignItems: 'center' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#333' 
  },
  paymentOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE', 
    width: '100%', 
    justifyContent: 'center', 
    gap: 12 
  },
  paymentText: { 
    fontSize: 16, 
    color: '#333' 
  },
  cancelButton: { 
    marginTop: 16, 
    padding: 12, 
    width: '100%', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    borderRadius: 10 
  },
  cancelButtonText: { 
    color: '#888', 
    fontSize: 14 
  },
});