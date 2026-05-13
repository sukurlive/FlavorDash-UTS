import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ActivityIndicator, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace('/');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password wajib diisi');
      return;
    }
    if (!isLogin && !name) {
      Alert.alert('Error', 'Nama wajib diisi untuk registrasi');
      return;
    }
    if (!isLogin && password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    
    setLoading(true);
    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(name, email, password);
    }
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Sukses', isLogin ? `Selamat datang!` : 'Registrasi berhasil!');
    } else {
      Alert.alert(isLogin ? 'Login Gagal' : 'Registrasi Gagal', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Icon name="restaurant" size={60} color="#4CAF50" style={styles.logo} />
        <Text style={styles.title}>FlavorDash</Text>
        <Text style={styles.subtitle}>{isLogin ? 'Login ke akun Anda' : 'Buat akun baru'}</Text>
        
        <View style={styles.switchContainer}>
          <Text style={isLogin ? styles.activeTab : styles.inactiveTab}>Login</Text>
          <Switch value={!isLogin} onValueChange={() => setIsLogin(!isLogin)} trackColor={{ false: '#4CAF50', true: '#2196F3' }} />
          <Text style={!isLogin ? styles.activeTab : styles.inactiveTab}>Register</Text>
        </View>
        
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color="#888" style={styles.inputIcon} />
            <TextInput placeholder="Nama Lengkap" value={name} onChangeText={setName} style={styles.input} placeholderTextColor="#999" editable={!loading} />
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#888" style={styles.inputIcon} />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#999" editable={!loading} />
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#888" style={styles.inputIcon} />
          <TextInput placeholder="Password" value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholderTextColor="#999" editable={!loading} />
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.demo}>{isLogin ? 'Demo: user@example.com / password123' : 'Minimal password 6 karakter'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#FFF' },
  logo: { alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#333' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#888', marginBottom: 32 },
  switchContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 30, gap: 15 },
  activeTab: { fontSize: 16, fontWeight: 'bold', color: '#2196F3' },
  inactiveTab: { fontSize: 14, color: 'gray' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDD', borderRadius: 10, marginBottom: 16, backgroundColor: '#FAFAFA', paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#333' },
  button: { backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  demo: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 12 },
});