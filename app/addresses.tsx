import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../context/AuthContext';

type Address = {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  is_default: boolean;
};

export default function AddressesScreen() {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: 'Rumah',
    recipient_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    is_default: false
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useFocusEffect(useCallback(() => { fetchAddresses(); }, []));

  const fetchAddresses = async () => {
    const token = await getStorageItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Fetch addresses error:', error);
      Alert.alert('Error', 'Gagal mengambil data alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.recipient_name || !formData.phone || !formData.address || !formData.city) {
      Alert.alert('Error', 'Harap isi semua field yang wajib');
      return;
    }

    setSubmitting(true);
    const token = await getStorageItem('accessToken');
    
    try {
      if (editingAddress) {
        await axios.put(`${API_URL}/api/addresses/${editingAddress.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Sukses', 'Alamat berhasil diperbarui');
      } else {
        await axios.post(`${API_URL}/api/addresses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Sukses', 'Alamat berhasil ditambahkan');
      }
      setModalVisible(false);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Gagal menyimpan alamat');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (address: Address) => {
    Alert.alert('Hapus Alamat', `Hapus alamat "${address.label}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          const token = await getStorageItem('accessToken');
          try {
            await axios.delete(`${API_URL}/api/addresses/${address.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Sukses', 'Alamat berhasil dihapus');
            fetchAddresses();
          } catch (error) {
            Alert.alert('Error', 'Gagal menghapus alamat');
          }
        }
      }
    ]);
  };

  const setDefault = async (address: Address) => {
    if (address.is_default) return;
    
    const token = await getStorageItem('accessToken');
    try {
      await axios.put(`${API_URL}/api/addresses/${address.id}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Sukses', 'Alamat utama berhasil diubah');
      fetchAddresses();
    } catch (error) {
      Alert.alert('Error', 'Gagal mengubah alamat utama');
    }
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      postal_code: address.postal_code || '',
      is_default: address.is_default
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setEditingAddress(null);
    setFormData({
      label: 'Rumah',
      recipient_name: '',
      phone: '',
      address: '',
      city: '',
      postal_code: '',
      is_default: false
    });
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Icon name="lock" size={64} color="#888" />
        <Text style={styles.emptyText}>Login Diperlukan</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Login Sekarang</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alamat Saya</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Icon name="add" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="location-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Belum Ada Alamat</Text>
          <Text style={styles.emptySubText}>Tambahkan alamat untuk memudahkan pengiriman</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Tambah Alamat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.addressCard, item.is_default && styles.defaultCard]}>
              <View style={styles.addressHeader}>
                <View style={styles.labelContainer}>
                  <Icon name={item.label === 'Rumah' ? 'home' : item.label === 'Kantor' ? 'business' : 'place'} size={20} color="#4CAF50" />
                  <Text style={styles.addressLabel}>{item.label}</Text>
                  {item.is_default && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Utama</Text></View>}
                </View>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Icon name="edit" size={20} color="#888" />
                </TouchableOpacity>
              </View>
              <Text style={styles.recipientName}>{item.recipient_name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
              <Text style={styles.cityText}>{item.city} {item.postal_code}</Text>
              <View style={styles.addressActions}>
                {!item.is_default && (
                  <TouchableOpacity style={styles.actionButton} onPress={() => setDefault(item)}>
                    <Text style={styles.actionButtonText}>Jadikan Utama</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
                  <Text style={[styles.actionButtonText, styles.deleteText]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddress ? 'Edit Alamat' : 'Tambah Alamat'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Label</Text>
                <View style={styles.labelButtons}>
                  {['Rumah', 'Kantor', 'Lainnya'].map((l) => (
                    <TouchableOpacity key={l} style={[styles.labelButton, formData.label === l && styles.labelButtonActive]} onPress={() => setFormData({ ...formData, label: l })}>
                      <Text style={[styles.labelButtonText, formData.label === l && styles.labelButtonTextActive]}>{l}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nama Penerima <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.input} value={formData.recipient_name} onChangeText={(v) => setFormData({ ...formData, recipient_name: v })} placeholder="Masukkan nama penerima" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nomor Telepon <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.input} value={formData.phone} onChangeText={(v) => setFormData({ ...formData, phone: v })} placeholder="Masukkan nomor telepon" keyboardType="phone-pad" />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Alamat Lengkap <Text style={styles.required}>*</Text></Text>
                <TextInput style={[styles.input, styles.textArea]} value={formData.address} onChangeText={(v) => setFormData({ ...formData, address: v })} placeholder="Masukkan alamat lengkap" multiline numberOfLines={3} />
              </View>
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 2, marginRight: 8 }]}>
                  <Text style={styles.label}>Kota <Text style={styles.required}>*</Text></Text>
                  <TextInput style={styles.input} value={formData.city} onChangeText={(v) => setFormData({ ...formData, city: v })} placeholder="Kota" />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Kode Pos</Text>
                  <TextInput style={styles.input} value={formData.postal_code} onChangeText={(v) => setFormData({ ...formData, postal_code: v })} placeholder="Kode Pos" keyboardType="numeric" />
                </View>
              </View>
              <View style={styles.formGroup}>
                <TouchableOpacity style={styles.checkbox} onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}>
                  <View style={[styles.checkboxBox, formData.is_default && styles.checkboxChecked]}>
                    {formData.is_default && <Icon name="check" size={14} color="#FFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Jadikan alamat utama</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.saveButton, submitting && styles.disabledButton]} onPress={handleSave} disabled={submitting}>
                <Text style={styles.saveButtonText}>{submitting ? 'Menyimpan...' : 'Simpan Alamat'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  listContent: { padding: 16 },
  addressCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  defaultCard: { borderWidth: 1, borderColor: '#4CAF50' },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressLabel: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  defaultText: { fontSize: 10, color: '#4CAF50', fontWeight: '600' },
  recipientName: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  phone: { fontSize: 13, color: '#888', marginBottom: 8 },
  addressText: { fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 18 },
  cityText: { fontSize: 12, color: '#888', marginBottom: 12 },
  addressActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  actionButtonText: { fontSize: 12, color: '#4CAF50' },
  deleteButton: { backgroundColor: '#FFEBEE' },
  deleteText: { color: '#f44336' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#888', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8 },
  addButton: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 20, marginTop: 20 },
  addButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  loginButton: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 25, marginTop: 20 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#f44336' },
  labelButtons: { flexDirection: 'row', gap: 12 },
  labelButton: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5' },
  labelButtonActive: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50' },
  labelButtonText: { fontSize: 14, color: '#888' },
  labelButtonTextActive: { color: '#4CAF50', fontWeight: '600' },
  input: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 10, padding: 12, fontSize: 14, color: '#333' },
  textArea: { height: 80, textAlignVertical: 'top' },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkboxBox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#4CAF50' },
  checkboxLabel: { fontSize: 14, color: '#333' },
  saveButton: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#aaa' },
});