import React, { useState, useEffect } from 'react';
import {
  FlatList, View, Text, Image, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../context/AuthContext';
import { Product } from '../types/product';

// ========== TIPE DATA KATEGORI ==========
type Category = {
  id: number;
  uuid: string;
  name: string;
  icon: string;
};

// ========== COMPONENT CARD PRODUK ==========
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

// ========== COMPONENT TAB KATEGORI ==========
function CategoryTab({ category, isActive, onPress }: { category: Category; isActive: boolean; onPress: () => void }) {
  const getIconName = (iconName: string) => {
    switch(iconName) {
      case 'restaurant': return 'restaurant';
      case 'local-cafe': return 'local-cafe';
      case 'fastfood': return 'fastfood';
      default: return 'restaurant-menu';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.categoryTab, isActive && styles.categoryTabActive]} 
      onPress={onPress}
    >
      <Icon name={getIconName(category.icon)} size={18} color={isActive ? '#4CAF50' : '#888'} />
      <Text style={[styles.categoryTabText, isActive && styles.categoryTabTextActive]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

// ========== MAIN PRODUCTS SCREEN ==========
export default function ProductsScreen() {
  const { refreshCartCount, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Ambil data kategori dari backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      console.log('Categories fetched:', response.data);
      setCategories(response.data);
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0].id);
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Ambil produk berdasarkan kategori
  const fetchProductsByCategory = async (categoryId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/products/category/${categoryId}`);
      console.log(`Products for category ${categoryId}:`, response.data.length);
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch products by category error:', error);
      Alert.alert('Error', 'Gagal mengambil data produk');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tambah ke keranjang
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

  // Load kategori saat komponen mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load produk saat kategori berubah
  useEffect(() => {
    if (selectedCategory !== null) {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Refresh manual
  const onRefresh = () => { 
    setRefreshing(true); 
    if (selectedCategory !== null) {
      fetchProductsByCategory(selectedCategory);
    }
  };

  // Loading state untuk kategori
  if (loadingCategories) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat kategori...</Text>
      </View>
    );
  }

  // Loading state untuk produk
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
      {/* Horizontal Scroll Kategori */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <CategoryTab
                key={category.id}
                category={category}
                isActive={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* List Produk */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} onBuy={addToCart} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="restaurant-menu" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Tidak ada produk di kategori ini</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  listContent: { 
    paddingTop: 8, 
    paddingBottom: 16 
  },
  categoriesContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriesScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  categoryTabActive: {
    backgroundColor: '#E8F5E9',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#888',
  },
  categoryTabTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  card: { 
    flexDirection: 'row', 
    padding: 12, 
    marginVertical: 6, 
    marginHorizontal: 16, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.08, 
    shadowRadius: 4, 
    elevation: 2 
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    marginRight: 12 
  },
  details: { 
    flex: 1, 
    justifyContent: 'space-between' 
  },
  name: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    color: '#333' 
  },
  price: { 
    fontSize: 14, 
    color: '#4CAF50', 
    fontWeight: '600', 
    marginBottom: 4 
  },
  description: { 
    fontSize: 11, 
    color: '#888', 
    marginBottom: 8 
  },
  buyButton: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 20, 
    alignSelf: 'flex-start', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  buyButtonText: { 
    color: '#FFF', 
    fontSize: 12, 
    fontWeight: '600', 
    marginLeft: 4 
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
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 50 
  },
  emptyText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#ccc' 
  },
});