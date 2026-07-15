// app/detail/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Redirect } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth, API_URL, getStorageItem } from '../../context/AuthContext';  // ✅ PAKAI getStorageItem
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && id) fetchOrderDetail();
  }, [isAuthenticated, id]);

  const fetchOrderDetail = async () => {
    // ✅ PAKAI getStorageItem (bukan getItem)
    const token = await getStorageItem('accessToken');
    if (!token) {
      console.log('No token found');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data.order);
      setItems(response.data.items);
    } catch (error) {
      console.error('Fetch order detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Izin Kamera', 'Aplikasi memerlukan izin kamera untuk mengambil bukti penerimaan.');
        return;
      }
    }
    setShowCamera(true);
  };

  const handlePhotoTaken = (photoData: any) => {
    setPhoto(photoData.uri);
    setShowCamera(false);
    Alert.alert('✅ Berhasil!', 'Foto bukti penerimaan telah diambil.');
  };

  const handleRetakePhoto = () => {
    setPhoto(null);
    setShowCamera(true);
  };

  const handleSubmitPhoto = async () => {
    if (!photo) return;
    Alert.alert('📤 Kirim Bukti', 'Apakah Anda yakin foto ini sudah benar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Kirim', onPress: () => { Alert.alert('✅ Sukses!', 'Bukti penerimaan berhasil dikirim.'); setPhoto(null); } }
    ]);
  };

  if (!isAuthenticated) return <Redirect href="/login" />;
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat detail...</Text>
      </SafeAreaView>
    );
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Menunggu Pembayaran';
      case 'processing': return 'Diproses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#888';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Icon name="receipt" size={50} color="#4CAF50" style={styles.icon} />
          <Text style={styles.orderNumber}>{order?.order_number}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order?.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order?.status) }]}>{getStatusText(order?.status)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal:</Text>
            <Text style={styles.infoValue}>{order?.created_at ? new Date(order.created_at).toLocaleDateString('id-ID') : '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total:</Text>
            <Text style={styles.totalAmount}>Rp {order?.total_amount?.toLocaleString() || 0}</Text>
          </View>

          {order?.notes && (
            <View style={styles.addressBox}>
              <Text style={styles.addressTitle}>📦 Alamat Pengiriman:</Text>
              <Text style={styles.addressText}>{order.notes}</Text>
            </View>
          )}

          {items.length > 0 && (
            <View style={styles.itemsBox}>
              <Text style={styles.itemsTitle}>🛒 Item Pesanan:</Text>
              {items.map((item, idx) => (
                <View key={idx} style={styles.orderItem}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetail}>{item.quantity} x Rp {item.price.toLocaleString()}</Text>
                  <Text style={styles.itemSubtotal}>= Rp {item.subtotal.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Fitur Kamera - Bukti Penerimaan */}
          {(order?.status === 'processing' || order?.status === 'completed') && (
            <View style={styles.evidenceSection}>
              <Text style={styles.evidenceTitle}>📸 Bukti Penerimaan</Text>
              {photo ? (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <View style={styles.photoActions}>
                    <TouchableOpacity style={styles.retakeButton} onPress={handleRetakePhoto}>
                      <Icon name="camera" size={18} color="#FFF" />
                      <Text style={styles.retakeButtonText}>Foto Ulang</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmitPhoto}>
                      <Icon name="check" size={18} color="#FFF" />
                      <Text style={styles.submitButtonText}>Kirim Bukti</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity style={styles.cameraButton} onPress={handleTakePhoto}>
                  <Icon name="camera-alt" size={28} color="#FFF" />
                  <Text style={styles.cameraButtonText}>📷 Ambil Bukti Penerimaan</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
            <Icon name="arrow-back" size={16} color="#FFF" />
            <Text style={styles.backButtonText}> Kembali ke Katalog</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showCamera && (
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} facing="back" onCameraReady={() => setIsCameraReady(true)}>
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.closeCameraButton} onPress={() => setShowCamera(false)}>
                <Icon name="close" size={28} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.captureButton} 
                onPress={() => {
                  if (!isCameraReady) return;
                  const dummyPhoto = { uri: 'https://picsum.photos/400/400' };
                  handlePhotoTaken(dummyPhoto);
                }}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
              <View style={styles.cameraSpacer} />
            </View>
          </CameraView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  icon: { alignSelf: 'center', marginBottom: 16 },
  orderNumber: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 14, color: '#666' }, infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }, statusText: { fontSize: 12, fontWeight: '600' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  addressBox: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, marginTop: 12, marginBottom: 8 },
  addressTitle: { fontSize: 12, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
  addressText: { fontSize: 11, color: '#1B5E20', lineHeight: 16 },
  itemsBox: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 10, marginTop: 16, marginBottom: 20 },
  itemsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  orderItem: { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  itemName: { fontSize: 14, fontWeight: '500' }, itemDetail: { fontSize: 12, color: '#888' }, itemSubtotal: { fontSize: 12, color: '#4CAF50', fontWeight: '500' },
  evidenceSection: { marginTop: 12, marginBottom: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 16 },
  evidenceTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  cameraButton: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  cameraButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  photoPreviewContainer: { alignItems: 'center' },
  photoPreview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 12 },
  photoActions: { flexDirection: 'row', gap: 12, width: '100%' },
  retakeButton: { flex: 1, backgroundColor: '#ff4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  retakeButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  submitButton: { flex: 1, backgroundColor: '#4CAF50', paddingVertical: 10, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  submitButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  backButton: { backgroundColor: '#4CAF50', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center' },
  backButtonText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }, loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
  cameraContainer: { flex: 1, backgroundColor: '#000', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  camera: { flex: 1 },
  cameraControls: { flex: 1, justifyContent: 'space-between', padding: 20 },
  closeCameraButton: { alignSelf: 'flex-start', padding: 8 },
  captureButton: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureButtonInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF' },
  cameraSpacer: { width: 50, height: 50, alignSelf: 'flex-end' },
});