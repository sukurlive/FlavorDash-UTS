import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL, getStorageItem, useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (user?.role !== "admin") {
      router.replace("/");
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Mengalihkan...</Text>
      </SafeAreaView>
    );
  }

  const fetchDashboardData = async () => {
    const token = await getStorageItem("accessToken");
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orders = response.data.orders || [];
      setStats({
        totalOrders: orders.length,
        pending: orders.filter((o: any) => o.status === "pending").length,
        processing: orders.filter((o: any) => o.status === "processing").length,
        completed: orders.filter((o: any) => o.status === "completed").length,
        cancelled: orders.filter((o: any) => o.status === "cancelled").length,
      });
      setRecentOrders(orders.slice(0, 5));
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert("Akses Ditolak", "Anda tidak memiliki akses admin");
        router.replace("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Apakah Anda yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat dashboard...</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800";
      case "processing":
        return "#2196F3";
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return "#f44336";
      default:
        return "#888";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "processing":
        return "Diproses";
      case "completed":
        return "Selesai";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: "#E3F2FD" }]}>
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Pesanan</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.statNumber, { color: "#FF9800" }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Menunggu</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>
              {stats.processing}
            </Text>
            <Text style={styles.statLabel}>Diproses</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#FCE4EC" }]}>
            <Text style={[styles.statNumber, { color: "#f44336" }]}>
              {stats.cancelled}
            </Text>
            <Text style={styles.statLabel}>Dibatalkan</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push("/admin/orders")}
          >
            <Icon name="receipt" size={32} color="#4CAF50" />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Manajemen Pesanan</Text>
              <Text style={styles.menuDesc}>
                Lihat dan update semua pesanan
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push("/admin/products")}
          >
            <Icon name="shopping-bag" size={32} color="#2196F3" />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Manajemen Produk</Text>
              <Text style={styles.menuDesc}>
                Tambah, edit, dan hapus produk
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuCard}
            onPress={() => router.push("/admin/users")}
          >
            <Icon name="people" size={32} color="#FF9800" />
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Manajemen Pengguna</Text>
              <Text style={styles.menuDesc}>Kelola role dan data pengguna</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {recentOrders.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Pesanan Terbaru</Text>
              <TouchableOpacity onPress={() => router.push("/admin/orders")}>
                <Text style={styles.viewAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order: any) => (
              <TouchableOpacity
                key={order.id}
                style={styles.recentItem}
                onPress={() => {
                  if (!order.id) {
                    Alert.alert("Error", "ID Pesanan tidak valid");
                    return;
                  }
                  router.push(`/admin/order/${order.id}`);
                }}
              >
                <View>
                  <Text style={styles.recentOrderNumber}>
                    {order.order_number}
                  </Text>
                  <Text style={styles.recentUser}>{order.user_name}</Text>
                </View>
                <View style={styles.recentRight}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                  <Text style={styles.recentTotal}>
                    Rp {order.total_amount.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 24,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#888" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8 },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    margin: 4,
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#2196F3" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  menuSection: { padding: 16 },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuTextContainer: { flex: 1, marginLeft: 12 },
  menuTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  menuDesc: { fontSize: 12, color: "#888" },
  recentSection: { padding: 16 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  viewAllText: { fontSize: 12, color: "#4CAF50", fontWeight: "600" },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  recentOrderNumber: { fontSize: 14, fontWeight: "bold", color: "#333" },
  recentUser: { fontSize: 12, color: "#888", marginTop: 2 },
  recentRight: { alignItems: "flex-end" },
  recentTotal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: "600" },
});
