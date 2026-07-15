import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";

// ========== LOKASI RESTORAN ==========
const RESTAURANT_LOCATION = {
  latitude: -6.2088, // Ganti dengan koordinat restoran Anda yang sebenarnya
  longitude: 106.8456,
  title: "FlavorDash Restaurant",
  description: "Dapur Pusat FlavorDash",
};

export default function MapsScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Izin lokasi ditolak. Gunakan lokasi default.");
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
        setErrorMsg("Gagal mendapatkan lokasi.");
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

  // ✅ FUNGSI UNTUK MEMBUKA GOOGLE MAPS DENGAN RUTE
  const openGoogleMapsRoute = (destLat: number, destLng: number) => {
    const origin = `${RESTAURANT_LOCATION.latitude},${RESTAURANT_LOCATION.longitude}`;
    const destination = `${destLat},${destLng}`;

    // URL Universal Google Maps untuk navigasi (berfungsi di Android & iOS)
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert("Error", "Tidak dapat membuka aplikasi peta");
        }
      })
      .catch(() => {
        Alert.alert("Error", "Gagal membuka rute");
      });
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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Lokasi & Rute</Text>
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

          {/* Marker Lokasi User (Sebagai Titik Pengiriman) */}
          {location && (
            <Marker
              coordinate={location}
              title="📍 Lokasi Pengiriman Anda"
              description="Ketuk untuk melihat rute"
              pinColor="#FF6B35"
            />
          )}
        </MapView>

        {/* Info Card & Tombol Navigasi */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="place" size={20} color="#4CAF50" />
            <View>
              <Text style={styles.infoText}>🏪 FlavorDash Restaurant</Text>
              <Text style={styles.infoSubText}>
                {RESTAURANT_LOCATION.description}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {location ? (
            <>
              <View style={styles.infoRow}>
                <Icon name="my-location" size={20} color="#FF6B35" />
                <View>
                  <Text style={styles.infoText}>📍 Lokasi Pengiriman Anda</Text>
                  <Text style={styles.infoSubText}>
                    Lat: {location.latitude.toFixed(4)}, Lng:{" "}
                    {location.longitude.toFixed(4)}
                  </Text>
                </View>
              </View>

              {/* ✅ TOMBOL BUKA RUTE DI GOOGLE MAPS */}
              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  openGoogleMapsRoute(location.latitude, location.longitude)
                }
              >
                <Icon name="directions" size={20} color="#FFF" />
                <Text style={styles.navButtonText}>
                  🗺️ Buka Rute di Google Maps
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>
              ⚠️ {errorMsg || "Lokasi tidak tersedia"}
            </Text>
          )}
        </View>
      </View>
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
  headerTitle: { fontSize: 16, fontWeight: "bold", flex: 1, marginLeft: 12 },
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: { marginTop: 12, fontSize: 14, color: "#888" },
  customMarker: { alignItems: "center" },
  markerBubble: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  markerTitle: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  infoCard: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12,
  },
  infoText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  infoSubText: { fontSize: 12, color: "#888", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginVertical: 12 },
  errorText: {
    fontSize: 12,
    color: "#f44336",
    textAlign: "center",
    marginTop: 8,
  },

  // ✅ STYLE BARU UNTUK TOMBOL NAVIGASI
  navButton: {
    backgroundColor: "#2196F3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
