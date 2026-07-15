import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { API_URL, getStorageItem, useAuth } from "../../context/AuthContext";

export default function AdminUsers() {
  const { isAuthenticated, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const router = useRouter();

  const fetchUsers = async () => {
    const token = await getStorageItem("accessToken");
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users || []);
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
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleChangeRole = (targetUser: any) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    const roleLabel = newRole === "admin" ? "Admin" : "Pengguna Biasa";

    Alert.alert(
      "Ubah Role",
      `Ubah role "${targetUser.name}" menjadi "${roleLabel}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ubah",
          onPress: async () => {
            const token = await getStorageItem("accessToken");
            try {
              await axios.put(
                `${API_URL}/api/admin/users/${targetUser.id}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } },
              );
              Alert.alert(
                "Sukses",
                `Role berhasil diubah menjadi ${roleLabel}`,
              );
              fetchUsers();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.error || "Gagal mengubah role",
              );
            }
          },
        },
      ],
    );
  };

  const openEditModal = (targetUser: any) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name || "");
    setEditEmail(targetUser.email || "");
    setEditPhone(targetUser.phone || "");
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    if (!editName.trim()) {
      Alert.alert("Error", "Nama tidak boleh kosong");
      return;
    }

    const token = await getStorageItem("accessToken");
    try {
      await axios.put(
        `${API_URL}/api/admin/users/${editingUser.id}`,
        { name: editName, email: editEmail, phone: editPhone },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert("Sukses", "Data pengguna berhasil diperbarui");
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Gagal memperbarui data pengguna",
      );
    }
  };

  const handleDeleteUser = (targetUser: any) => {
    Alert.alert(
      "Hapus Pengguna",
      `Yakin ingin menghapus pengguna "${targetUser.name}"?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            const token = await getStorageItem("accessToken");
            try {
              await axios.delete(
                `${API_URL}/api/admin/users/${targetUser.id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              Alert.alert("Sukses", "Pengguna berhasil dihapus");
              fetchUsers();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.error || "Gagal menghapus pengguna",
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
        <Text style={styles.loadingText}>Memuat pengguna...</Text>
      </SafeAreaView>
    );
  }

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Icon name="person" size={24} color="#FFF" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || "Tanpa Nama"}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          {item.phone && <Text style={styles.userPhone}>{item.phone}</Text>}
        </View>
      </View>

      <View style={styles.userMeta}>
        <View style={styles.metaItem}>
          <Icon name="calendar-today" size={14} color="#666" />
          <Text style={styles.metaText}>
            {new Date(item.created_at).toLocaleDateString("id-ID")}
          </Text>
        </View>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: item.role === "admin" ? "#f44336" : "#4CAF50" },
          ]}
        >
          <Text style={styles.roleText}>
            {item.role === "admin" ? "Admin" : "User"}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#2196F3" }]}
          onPress={() => openEditModal(item)}
        >
          <Icon name="edit" size={16} color="#FFF" />
          <Text style={styles.actionBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: item.role === "admin" ? "#FFC107" : "#2196F3" },
          ]}
          onPress={() => handleChangeRole(item)}
        >
          <Icon name="swap-horiz" size={16} color="#FFF" />
          <Text style={styles.actionBtnText}>
            {item.role === "admin" ? "Turunkan" : "Naikkan"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#F44336" }]}
          onPress={() => handleDeleteUser(item)}
        >
          <Icon name="delete" size={16} color="#FFF" />
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
        <Text style={styles.headerTitle}>Manajemen Pengguna</Text>
        <View style={{ width: 24 }} />
      </View>

      {editingUser && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Pengguna</Text>
            <Text style={styles.modalLabel}>Nama</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nama"
            />
            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text style={styles.modalLabel}>Nomor Telepon</Text>
            <TextInput
              style={styles.modalInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Nomor telepon"
              keyboardType="phone-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEditingUser(null)}
              >
                <Text style={styles.modalButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalButtonText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="people" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Tidak ada pengguna</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon name="people" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Pengguna</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="admin-panel-settings" size={24} color="#f44336" />
              <Text style={styles.statValue}>
                {users.filter((u) => u.role === "admin").length}
              </Text>
              <Text style={styles.statLabel}>Admin</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="person" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>
                {users.filter((u) => u.role === "user").length}
              </Text>
              <Text style={styles.statLabel}>User</Text>
            </View>
          </View>

          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </>
      )}
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  listContent: {
    padding: 12,
  },
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  userMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
    flex: 1,
    minWidth: 90,
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13,
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
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  modalCard: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 8,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  modalCancelButton: {
    backgroundColor: "#CCC",
  },
  modalSaveButton: {
    backgroundColor: "#4CAF50",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
