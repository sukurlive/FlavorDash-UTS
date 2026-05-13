import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const features = [
    { icon: 'restaurant-menu', title: 'Katalog Makanan', description: 'Jelajahi berbagai pilihan makanan dan minuman favorit Anda' },
    { icon: 'shopping-cart', title: 'Keranjang Belanja', description: 'Tambahkan pesanan ke keranjang dan checkout dengan mudah' },
    { icon: 'local-offer', title: 'Harga Terjangkau', description: 'Nikmati harga terbaik untuk setiap pesanan Anda' },
    { icon: 'delivery-dining', title: 'Pengiriman Cepat', description: 'Pesanan akan segera diantar ke lokasi Anda' },
    { icon: 'payment', title: 'Pembayaran Mudah', description: 'Bayar dengan transfer bank atau COD' },
    { icon: 'security', title: 'Aman & Terpercaya', description: 'Sistem keamanan JWT untuk melindungi data Anda' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroIconContainer}>
          <Icon name="fastfood" size={60} color="#4CAF50" />
        </View>
        <Text style={styles.heroTitle}>FlavorDash</Text>
        <Text style={styles.heroSubtitle}>Aplikasi Katalog Makanan Terlengkap</Text>
        <Text style={styles.heroDescription}>
          Temukan berbagai macam makanan dan minuman favorit Anda hanya di FlavorDash
        </Text>
      </View>

      {/* CTA Button */}
      <View style={styles.ctaSection}>
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={() => router.push('/products')}
        >
          <Icon name="restaurant-menu" size={20} color="#FFF" />
          <Text style={styles.ctaButtonText}> Jelajahi Menu Kami</Text>
        </TouchableOpacity>
        
        {!isAuthenticated && (
          <TouchableOpacity 
            style={[styles.ctaButton, styles.ctaButtonSecondary]} 
            onPress={() => router.push('/login')}
          >
            <Icon name="login" size={20} color="#FFF" />
            <Text style={styles.ctaButtonText}> Login / Register</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fitur Section */}
      <View style={styles.section}>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Icon name={feature.icon} size={28} color="#4CAF50" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Statistik Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>25+</Text>
          <Text style={styles.statLabel}>Menu Produk</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3+</Text>
          <Text style={styles.statLabel}>Kategori</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>100%</Text>
          <Text style={styles.statLabel}>Kepuasan</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 FlavorDash by SUKUR 411231087</Text>
        <Text style={styles.footerSubText}>Aplikasi Katalog Makanan</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heroSection: {
    backgroundColor: '#FFF',
    paddingTop: 0,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaButtonSecondary: {
    backgroundColor: '#2196F3',
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 12,
    color: '#aaa',
  },
});