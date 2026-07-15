// app/admin/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

function AdminHeader() {
  const router = useRouter();
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()}>
        <Icon name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Admin Panel</Text>
      <TouchableOpacity onPress={() => router.push('/')}>
        <Icon name="home" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerTitle: 'Dashboard Admin',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ 
          headerTitle: 'Manajemen Pesanan',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="order/[id]" 
        options={{ 
          headerTitle: 'Detail Pesanan',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
          headerShown: true,
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});