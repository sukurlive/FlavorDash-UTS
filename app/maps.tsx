// app/maps.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialIcons';

// ========== LOKASI RESTORAN ==========
const RESTAURANT_LOCATION = {
  latitude: -6.200000,  // Ganti dengan koordinat restoran Anda
  longitude: 106.816666,
  title: 'FlavorDash Restaurant',
  description: 'Jl. Contoh No. 123, Jakarta Selatan'
};

// ========== LOKASI DUMMY UNTUK PENGIRIMAN ==========
const DELIVERY_LOCATIONS = [
  {
    id: 1,
    latitude: -6.190000,
    longitude: 106.820000,
    title: 'Alamat Pengiriman 1',
    description: 'Jl. Mawar No. 45, Jakarta'
  },
  {
    id: 2,
    latitude: -6.210000,
    longitude: 106.810000,
    title: 'Alamat Pengiriman 2',
    description: 'Jl. Melati No. 12, Jakarta'
  }
];

export default function MapsScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin lokasi ditolak. Gunakan lokasi default.');
        setLoading(false);
        return;
      }

      try {
        let userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
      } catch (error) {
        setErrorMsg('Gagal mendapatkan lokasi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const initialRegion = {
    latitude: RESTAURANT_LOCATION.latitude,
    longitude: RESTAURANT_LOCATION.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Memuat peta...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Lokasi Restoran & Pengiriman</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Marker Restoran */}
          <Marker
            coordinate={RESTAURANT_LOCATION}
            title={RESTAURANT_LOCATION.title}
            description={RESTAURANT_LOCATION.description}
            pinColor="#4CAF50"
          >
            <View style={styles.customMarker}>
              <Icon name="restaurant" size={30} color="#4CAF50" />
              <View style={styles.markerBubble}>
                <Text style={styles.markerTitle}>FlavorDash</Text>
              </View>
            </View>
          </Marker>

          {/* Marker Lokasi Pengiriman */}
          {DELIVERY_LOCATIONS.map((loc) => (
            <Marker
              key={loc.id}
              coordinate={loc}
              title={loc.title}
              description={loc.description}
              pinColor="#2196F3"
            />
          ))}

          {/* Marker Lokasi User */}
          {location && (
            <Marker
              coordinate={location}
              title="📍 Lokasi Saya"
              pinColor="#FF6B35"
            />
          )}
        </MapView>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="place" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>🏪 FlavorDash Restaurant</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="location-on" size={20} color="#2196F3" />
            <Text style={styles.infoAddress}>📦 Lokasi Pengiriman Tersedia</Text>
          </View>
          {location && (
            <View style={styles.infoRow}>
              <Icon name="my-location" size={20} color="#FF6B35" />
              <Text style={styles.infoAddress}>📍 Lokasi Anda terdeteksi</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginLeft: 12 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#888' },
  customMarker: { alignItems: 'center' },
  markerBubble: { backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  markerTitle: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 10 },
  infoText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  infoAddress: { fontSize: 12, color: '#888', flex: 1 },
});