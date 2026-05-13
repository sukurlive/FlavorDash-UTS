import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin logout?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        }
      }
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="lock" size={64} color="#888" />
        <Text style={styles.emptyText}>Belum Login</Text>
        <Text style={styles.emptySubText}>Silakan login untuk mengakses profil</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Login Sekarang</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerProfile}>
          <Icon name="account-circle" size={80} color="#4CAF50" />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>{user.role === 'admin' ? 'Administrator' : 'Member'}</Text>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Akun Saya</Text>
          
          {/* EDIT PROFILE */}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
            <Icon name="edit" size={22} color="#555" />
            <Text style={styles.menuItemText}>Edit Profil</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* ALAMAT SAYA */}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/addresses')}>
            <Icon name="location-on" size={22} color="#555" />
            <Text style={styles.menuItemText}>Alamat Saya</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
            <Icon name="receipt" size={22} color="#555" />
            <Text style={styles.menuItemText}>Pesanan Saya</Text>
            <Icon name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#ff4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#888', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  loginButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 25 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  headerProfile: { backgroundColor: '#FFF', alignItems: 'center', paddingTop: 32, paddingBottom: 24, marginBottom: 12 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#888', marginBottom: 4 },
  userRole: { fontSize: 12, color: '#4CAF50', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8 },
  menuSection: { backgroundColor: '#FFF', marginBottom: 12, paddingVertical: 8 },
  menuSectionTitle: { fontSize: 14, fontWeight: '600', color: '#888', marginHorizontal: 16, marginTop: 8, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  menuItemText: { flex: 1, fontSize: 15, color: '#333' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', paddingVertical: 16, marginHorizontal: 16, borderRadius: 12, gap: 8, marginBottom: 20 },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: '#ff4444' },
});