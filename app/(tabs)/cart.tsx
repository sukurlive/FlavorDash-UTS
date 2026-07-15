import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL, getStorageItem, useAuth } from "../../context/AuthContext";
import { CartItem } from "../types/product";

export default function CartScreen() {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // ✅ STATE BARU UNTUK ALAMAT PENGIRIMAN
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  const router = useRouter();

  // Auto refresh setiap kali screen focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchCart();
        fetchAddresses();
      }
    }, [isAuthenticated]),
  );

  const fetchAddresses = async () => {
    const token = await getStorageItem("accessToken");
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = response.data.addresses || [];
      setAddresses(list);

      // ✅ Otomatis pilih alamat yang di-set sebagai default
      const defaultAddr = list.find((a: any) => a.is_default) || list[0];
      if (defaultAddr) setSelectedAddress(defaultAddr);
    } catch (error) {
      console.error("Gagal ambil alamat:", error);
    }
  };

  const fetchCart = async () => {
    const token = await getStorageItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data.cart || []);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert("Sesi Habis", "Silakan login kembali", [
          { text: "OK", onPress: () => router.replace("/login") },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    const token = await getStorageItem("accessToken");
    if (!token) return;
    try {
      await axios.put(
        `${API_URL}/api/cart/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchCart();
    } catch (error) {
      Alert.alert("Error", "Gagal mengupdate jumlah");
    }
  };

  const removeItem = async (productId: number, productName: string) => {
    Alert.alert("Hapus Item", `Hapus ${productName} dari keranjang?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const token = await getStorageItem("accessToken");
          if (!token) {
            Alert.alert("Error", "Silakan login kembali");
            return;
          }
          try {
            await axios({
              method: "delete",
              url: `${API_URL}/api/cart/remove`,
              data: { productId },
              headers: { Authorization: `Bearer ${token}` },
            });
            await fetchCart();
            Alert.alert("Berhasil", `${productName} dihapus dari keranjang`);
          } catch (error) {
            Alert.alert("Error", "Gagal menghapus item");
          }
        },
      },
    ]);
  };

  const processCheckout = async (paymentMethod: string) => {
    // ✅ 1. VALIDASI: Pastikan alamat sudah dipilih
    if (!selectedAddress) {
      Alert.alert(
        "Alamat Diperlukan",
        "Silakan tambahkan alamat pengiriman terlebih dahulu.",
        [
          { text: "Batal", style: "cancel" },
          { text: "Tambah Alamat", onPress: () => router.push("/addresses") },
        ],
      );
      setShowPaymentModal(false);
      return;
    }

    setShowPaymentModal(false);
    setCheckoutLoading(true);

    const token = await getStorageItem("accessToken");
    if (!token) {
      Alert.alert("Login Diperlukan", "Silakan login untuk checkout");
      setCheckoutLoading(false);
      return;
    }

    // ✅ 2. FORMAT ALAMAT LENGKAP UNTUK FIELD NOTES
    const fullAddress = `[${selectedAddress.label}] ${selectedAddress.recipient_name} (${selectedAddress.phone})\n${selectedAddress.address}, ${selectedAddress.city} ${selectedAddress.postal_code || ""}`;

    try {
      const response = await axios.post(
        `${API_URL}/api/checkout`,
        {
          paymentMethod,
          notes: "Pesanan dikirim ke alamat yang dipilih",
          address_id: selectedAddress.id,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        Alert.alert(
          "🎉 Terima Kasih!",
          `Order #${response.data.order.orderNumber}\nTotal: Rp ${response.data.order.totalAmount.toLocaleString()}\n\nPesanan akan segera dikirim ke:\n${fullAddress}`,
          // ✅ Redirect ke halaman orders agar user bisa melihat status pesanan barunya
          [{ text: "Lihat Pesanan", onPress: () => router.replace("/orders") }],
        );
        await fetchCart();
      }
    } catch (error: any) {
      Alert.alert(
        "Checkout Gagal",
        error.response?.data?.error || "Terjadi kesalahan",
      );
    } finally {
      setCheckoutLoading(false);
    }
  };

  const showPaymentOptions = () => {
    if (cart.length === 0) {
      Alert.alert("Keranjang Kosong", "Tidak ada item untuk di-checkout");
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
        <Text style={styles.emptySubText}>
          Silakan login untuk melihat keranjang belanja
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/login")}
        >
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
        <Text style={styles.emptySubText}>
          Belum ada produk di keranjang Anda
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/products")}
        >
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
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => processCheckout("transfer")}
            >
              <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
              <Text style={styles.paymentText}>Transfer Bank</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => processCheckout("cod")}
            >
              <Icon name="local-shipping" size={24} color="#4CAF50" />
              <Text style={styles.paymentText}>COD (Bayar di Tempat)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={styles.cancelButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FlatList
        data={cart}
        // ✅ HEADER BARU: INFORMASI ALAMAT PENGIRIMAN
        ListHeaderComponent={
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Icon name="location-on" size={20} color="#4CAF50" />
              <Text style={styles.addressTitle}>Alamat Pengiriman</Text>
            </View>
            {selectedAddress ? (
              <View>
                <Text style={styles.addrLabel}>
                  {selectedAddress.label} - {selectedAddress.recipient_name}
                </Text>
                <Text style={styles.addrPhone}>{selectedAddress.phone}</Text>
                <Text style={styles.addrText}>
                  {selectedAddress.address}, {selectedAddress.city}{" "}
                  {selectedAddress.postal_code || ""}
                </Text>
                <TouchableOpacity
                  style={styles.changeAddrBtn}
                  onPress={() => router.push("/addresses")}
                >
                  <Text style={styles.changeAddrBtnText}>Ganti Alamat →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addAddrBtn}
                onPress={() => router.push("/addresses")}
              >
                <Icon name="add-location" size={20} color="#4CAF50" />
                <Text style={styles.addAddrText}>Tambah Alamat Pengiriman</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListHeaderComponentStyle={styles.listHeader}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.product?.name}</Text>
              <TouchableOpacity
                onPress={() =>
                  removeItem(item.productId, item.product?.name || "item")
                }
              >
                <Icon name="delete-outline" size={22} color="#ff4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemPrice}>
              Rp {(item.product?.price || 0).toLocaleString()}
            </Text>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.subtotal}>
              Subtotal: Rp {item.subtotal.toLocaleString()}
            </Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
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
          style={[
            styles.checkoutButton,
            checkoutLoading && styles.disabledButton,
          ]}
          onPress={showPaymentOptions}
          disabled={checkoutLoading}
        >
          <Text style={styles.checkoutButtonText}>
            {checkoutLoading ? "Memproses..." : "Checkout"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  listHeader: { marginBottom: 8 }, // Jarak antara header alamat dan list

  // ✅ STYLE BARU UNTUK KARTU ALAMAT
  addressCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  addrLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  addrPhone: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  addrText: {
    fontSize: 13,
    color: "#888",
    lineHeight: 18,
  },
  changeAddrBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
  },
  changeAddrBtnText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  addAddrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    gap: 8,
  },
  addAddrText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },

  // STYLE LAMA (TETAP SAMA)
  cartItem: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemName: { fontSize: 16, fontWeight: "bold", flex: 1 },
  itemPrice: { fontSize: 14, color: "#4CAF50", marginTop: 2, marginBottom: 8 },
  itemActions: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  qtyButton: {
    width: 36,
    height: 36,
    backgroundColor: "#E0E0E0",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: { fontSize: 18, fontWeight: "bold" },
  qtyText: { fontSize: 16, marginHorizontal: 16 },
  subtotal: { fontSize: 12, color: "#888", textAlign: "right" },
  footer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "#4CAF50" },
  checkoutButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  disabledButton: { backgroundColor: "#aaa" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#888" },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#888",
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  shopButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginTop: 16,
  },
  shopButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    width: "100%",
    justifyContent: "center",
    gap: 12,
  },
  paymentText: { fontSize: 16, color: "#333" },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  cancelButtonText: { color: "#888", fontSize: 14 },
});
