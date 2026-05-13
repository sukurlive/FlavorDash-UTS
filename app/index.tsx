import React, { useState, useEffect } from 'react';
import {
  FlatList, View, Text, Image, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../context/AuthContext';
import { Product } from '../types/product';

function ProductCard({ product, onBuy }: { product: Product; onBuy: (product: Product) => void }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>Rp {product.price.toLocaleString()}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        <TouchableOpacity style={styles.buyButton} onPress={() => onBuy(product)}>
          <Icon name="shopping-cart" size={14} color="#FFF" />
          <Text style={styles.buyButtonText}> Beli Sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { refreshCartCount } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data);
    } catch (error) {
      Alert.alert('Error', 'Gagal mengambil data produk');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addToCart = async (product: Product) => {
    const token = await getStorageItem('accessToken');
    
    if (!token) {
      Alert.alert('Login Diperlukan', 'Silakan login terlebih dahulu untuk membeli', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/login') }
      ]);
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/cart/add`,
        { productId: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await refreshCartCount();
      Alert.alert('Berhasil', `${product.name} ditambahkan ke keranjang`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert('Session Habis', 'Silakan login kembali', [
          { text: 'OK', onPress: () => router.push('/login') }
        ]);
      } else {
        Alert.alert('Gagal', error.response?.data?.error || 'Gagal menambahkan');
      }
    }
  };

  useEffect(() => { 
    fetchProducts();
  }, []);

  const onRefresh = () => { 
    setRefreshing(true); 
    fetchProducts(); 
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat produk...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} onBuy={addToCart} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { paddingTop: 0, paddingBottom: 16 },
  card: { flexDirection: 'row', padding: 12, marginVertical: 6, marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  details: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: 15, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  price: { fontSize: 14, color: '#4CAF50', fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 11, color: '#888', marginBottom: 8 },
  buyButton: { backgroundColor: '#4CAF50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' },
  buyButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 4 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
});