import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL, getStorageItem, useAuth } from "../../context/AuthContext";

export default function AdminProducts() {
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    stock: "",
    category_id: "",
    is_available: true,
  });
  const router = useRouter();

  const fetchProducts = async () => {
    const token = await getStorageItem("accessToken");
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.products || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert("Akses Ditolak", "Anda tidak memiliki akses admin");
        router.replace("/");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        price: product.price?.toString() || "",
        description: product.description || "",
        stock: product.stock?.toString() || "",
        category_id: product.category_id?.toString() || "",
        is_available:
          product.is_available === 1 || product.is_available === true,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: "",
        description: "",
        stock: "10",
        category_id: "",
        is_available: true,
      });
    }
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      Alert.alert("Error", "Nama dan harga tidak boleh kosong");
      return;
    }

    const token = await getStorageItem("accessToken");
    if (!token) return;

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 10,
        category_id: formData.category_id
          ? parseInt(formData.category_id)
          : null,
      };

      if (editingProduct) {
        // Update product
        await axios.put(
          `${API_URL}/api/admin/products/${editingProduct.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Alert.alert("Sukses", "Produk berhasil diperbarui");
      } else {
        // Create product
        await axios.post(`${API_URL}/api/admin/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Alert.alert("Sukses", "Produk berhasil ditambahkan");
      }

      setModalVisible(false);
      fetchProducts();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Gagal menyimpan produk",
      );
    }
  };

  const handleDeleteProduct = (product: any) => {
    Alert.alert(
      "Hapus Produk",
      `Apakah Anda yakin ingin menghapus "${product.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const token = await getStorageItem("accessToken");
            try {
              await axios.delete(
                `${API_URL}/api/admin/products/${product.id}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              Alert.alert("Sukses", "Produk berhasil dihapus");
              fetchProducts();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.error || "Gagal menghapus produk",
              );
            }
          },
        },
      ],
    );
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="lock" size={64} color="#888" />
        <Text style={styles.emptyText}>Akses Admin Diperlukan</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat produk...</Text>
      </SafeAreaView>
    );
  }

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>
            Rp {parseInt(item.price).toLocaleString("id-ID")}
          </Text>
        </View>
        <View
          style={[
            styles.availableBadge,
            { backgroundColor: item.is_available ? "#4CAF50" : "#888" },
          ]}
        >
          <Text style={styles.availableText}>
            {item.is_available ? "Tersedia" : "Tidak"}
          </Text>
        </View>
      </View>
      <View style={styles.productMeta}>
        <View style={styles.metaItem}>
          <Icon name="inventory" size={16} color="#666" />
          <Text style={styles.metaText}>Stok: {item.stock}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="category" size={16} color="#666" />
          <Text style={styles.metaText}>
            {item.category_name || "Tanpa Kategori"}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleOpenModal(item)}
        >
          <Icon name="edit" size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDeleteProduct(item)}
        >
          <Icon name="delete" size={20} color="#FFF" />
          <Text style={styles.actionBtnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manajemen Produk</Text>
        <TouchableOpacity onPress={() => handleOpenModal()}>
          <Icon name="add-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="shopping-bag" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Tidak ada produk</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleOpenModal()}
          >
            <Icon name="add" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Tambah Produk</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal untuk tambah/edit produk */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Edit Produk" : "Tambah Produk"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nama Produk *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Nasi Goreng"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Harga (Rp) *</Text>
              <TextInput
                style={styles.input}
                placeholder="25000"
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Deskripsi</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Deskripsi produk..."
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Stok</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                keyboardType="numeric"
                value={formData.stock}
                onChangeText={(text) =>
                  setFormData({ ...formData, stock: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Kategori ID</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                keyboardType="numeric"
                value={formData.category_id}
                onChangeText={(text) =>
                  setFormData({ ...formData, category_id: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: formData.is_available ? "#4CAF50" : "#ccc",
                  },
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    is_available: !formData.is_available,
                  })
                }
              >
                <Icon
                  name={formData.is_available ? "check-circle" : "cancel"}
                  size={24}
                  color="#FFF"
                />
                <Text style={styles.toggleText}>
                  {formData.is_available ? "Tersedia" : "Tidak Tersedia"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSaveProduct}
              >
                <Icon name="save" size={24} color="#FFF" />
                <Text style={styles.submitBtnText}>
                  {editingProduct ? "Update Produk" : "Tambah Produk"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  listContent: {
    padding: 12,
  },
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  availableBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availableText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  productMeta: {
    flexDirection: "row",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    color: "#666",
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 4,
  },
  editBtn: {
    backgroundColor: "#2196F3",
  },
  deleteBtn: {
    backgroundColor: "#f44336",
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 12,
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },
  backButton: {
    marginTop: 16,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  backButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 24,
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    textAlignVertical: "top",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 6,
    gap: 8,
  },
  toggleText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 6,
    gap: 8,
  },
  submitBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
