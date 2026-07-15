import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL, getStorageItem, useAuth } from "../../../context/AuthContext";

const STATUSES = ["pending", "processing", "completed", "cancelled"];
const STATUS_LABELS: { [key: string]: string } = {
  pending: "Menunggu",
  processing: "Diproses / Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};
const STATUS_COLORS: { [key: string]: string } = {
  pending: "#FF9800",
  processing: "#2196F3",
  completed: "#4CAF50",
  cancelled: "#f44336",
};

export default function AdminOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const fetchOrderDetail = async () => {
    if (!id || id === "undefined" || id === "null") {
      Alert.alert("Error", "ID Pesanan tidak valid");
      router.back();
      return;
    }

    const token = await getStorageItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data.order);
      setItems(response.data.items);
    } catch (error: any) {
      Alert.alert("Error", "Gagal mengambil detail pesanan");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (newStatus === order?.status) return;

    Alert.alert(
      "Update Status",
      `Ubah status pesanan menjadi "${STATUS_LABELS[newStatus]}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Update",
          onPress: async () => {
            setUpdating(true);
            const token = await getStorageItem("accessToken");
            try {
              await axios.put(
                `${API_URL}/api/admin/orders/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } },
              );
              Alert.alert(
                "Sukses",
                `Status diubah menjadi ${STATUS_LABELS[newStatus]}`,
              );
              fetchOrderDetail();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.error || "Gagal update status",
              );
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  // FUNGSI BUKA GOOGLE MAPS UNTUK NAVIGASI PENGIRIMAN
  const openDeliveryRoute = () => {
    if (!order?.latitude || !order?.longitude) {
      Alert.alert(
        "Lokasi Tidak Tersedia",
        "Alamat ini tidak memiliki koordinat. Silakan hubungi pelanggan.",
      );
      return;
    }

    // Format URL Google Maps untuk Navigasi (Driving)
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}&travelmode=driving`;

    Linking.canOpenURL(mapsUrl).then((supported) => {
      if (supported) {
        Linking.openURL(mapsUrl);
      } else {
        Alert.alert("Error", "Tidak dapat membuka aplikasi peta");
      }
    });
  };

  useEffect(() => {
    if (authLoading || !user) return;
    if (isAuthenticated && user?.role === "admin") {
      fetchOrderDetail();
    } else {
      setLoading(false);
    }
  }, [id, isAuthenticated, user, authLoading]);

  if (loading || authLoading) {
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Informasi Order */}
        <View style={styles.card}>
          <View style={styles.orderNumberContainer}>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: STATUS_COLORS[order.status] + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: STATUS_COLORS[order.status] },
                ]}
              >
                {STATUS_LABELS[order.status]}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal:</Text>
            <Text style={styles.infoValue}>
              {new Date(order.created_at).toLocaleDateString("id-ID")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              Rp {order.total_amount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* 2. ✅ BARU: Informasi Pengiriman (Untuk Admin/Driver) */}
        <View style={[styles.card, styles.deliveryCard]}>
          <View style={styles.cardHeader}>
            <Icon name="local-shipping" size={20} color="#2196F3" />
            <Text style={styles.cardTitle}>Informasi Pengiriman</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="person" size={18} color="#666" />
            <Text style={styles.infoValue}>{order.user_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="email" size={18} color="#666" />
            <Text style={styles.infoValue}>{order.user_email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="location-on" size={18} color="#f44336" />
            <Text style={styles.infoValue}>
              {order.address || "Alamat tidak tersedia"}
            </Text>
          </View>
          {order.latitude && order.longitude && (
            <View style={styles.infoRow}>
              <Icon name="my-location" size={18} color="#2196F3" />
              <Text style={styles.infoValue}>
                Lat: {order.latitude}, Lng: {order.longitude}
              </Text>
            </View>
          )}

          {/* Tombol Navigasi */}
          <TouchableOpacity
            style={styles.navButton}
            onPress={openDeliveryRoute}
          >
            <Icon name="directions" size={20} color="#FFF" />
            <Text style={styles.navButtonText}>
              🗺️ Buka Rute di Google Maps
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Bukti Penerimaan (Jika ada) */}
        {order.proof_image && (
          <View style={styles.card}>
            <Text style={styles.itemsTitle}>📸 Bukti Penerimaan Pelanggan</Text>
            <Image
              source={{ uri: `${API_URL}${order.proof_image}` }}
              style={styles.proofImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* 4. Item Pesanan */}
        <View style={styles.card}>
          <Text style={styles.itemsTitle}>🛒 Item Pesanan</Text>
          {items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetail}>
                {item.quantity} x Rp {item.price.toLocaleString()}
              </Text>
              <Text style={styles.itemSubtotal}>
                = Rp {item.subtotal.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* 5. Update Status */}
        {!updating ? (
          <View style={styles.card}>
            <Text style={styles.statusTitle}>Update Status Pesanan</Text>
            <View style={styles.statusButtons}>
              {STATUSES.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    order.status === status && styles.statusButtonActive,
                    { borderColor: STATUS_COLORS[status] },
                  ]}
                  onPress={() => updateStatus(status)}
                  disabled={order.status === status}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      {
                        color:
                          order.status === status
                            ? "#FFF"
                            : STATUS_COLORS[status],
                      },
                    ]}
                  >
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

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/admin/orders")}
        >
          <Text style={styles.backButtonText}>← Kembali ke Daftar Pesanan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Style khusus kartu pengiriman
  deliveryCard: { borderLeftWidth: 4, borderLeftColor: "#2196F3" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },

  orderNumberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: { fontSize: 16, fontWeight: "bold", color: "#333" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: { fontSize: 14, color: "#666", width: 80 },
  infoValue: { fontSize: 14, color: "#333", fontWeight: "500", flex: 1 },
  totalAmount: { fontSize: 18, fontWeight: "bold", color: "#4CAF50" },

  // Tombol Navigasi
  navButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  navButtonText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },

  proofImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#EEE",
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  orderItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  itemName: { fontSize: 14, fontWeight: "500" },
  itemDetail: { fontSize: 12, color: "#888" },
  itemSubtotal: { fontSize: 12, color: "#4CAF50", fontWeight: "500" },
  statusTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  statusButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 8,
  },
  statusButtonActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  statusButtonText: { fontSize: 12, fontWeight: "600" },
  backButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  backButtonText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 24,
  },
  emptyText: { fontSize: 16, color: "#888", marginTop: 12 },
  loadingText: { marginTop: 12, fontSize: 14, color: "#888" },
  updatingContainer: { alignItems: "center", padding: 20 },
  updatingText: { marginTop: 12, fontSize: 14, color: "#888" },
});
