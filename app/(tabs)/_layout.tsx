import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../context/AuthContext";

function HomeHeader() {
  const { isAuthenticated, user, logout, cartCount, refreshCartCount } =
    useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCartCount();
      const interval = setInterval(() => refreshCartCount(), 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    setShowDropdown(false);
    Alert.alert("Logout", "Apakah Anda yakin ingin logout?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View
      style={[styles.headerContainer, { paddingTop: insets.top > 0 ? 0 : 0 }]}
    >
      <TouchableOpacity
        onPress={() => {
          setShowDropdown(false);
          router.push("/");
        }}
        activeOpacity={0.7}
        style={styles.logoContainer}
      >
        <Icon name="fastfood" size={40} color="#4CAF50" />
        <Text style={styles.headerTitle}>FlavorDash</Text>
      </TouchableOpacity>
      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={() =>
            isAuthenticated ? router.push("/cart") : router.push("/login")
          }
          style={styles.headerCartButton}
        >
          <Icon name="shopping-cart" size={24} color="#333" />
          {cartCount > 0 && (
            <View style={styles.headerCartBadge}>
              <Text style={styles.headerCartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            isAuthenticated
              ? setShowDropdown(!showDropdown)
              : router.push("/login")
          }
          style={styles.headerUserButton}
        >
          <Icon
            name={isAuthenticated ? "account-circle" : "person-outline"}
            size={28}
            color="#4CAF50"
          />
        </TouchableOpacity>
        {showDropdown && isAuthenticated && (
          <>
            <TouchableOpacity
              style={styles.dropdownOverlay}
              activeOpacity={1}
              onPress={() => setShowDropdown(false)}
            />
            <View
              style={[
                styles.dropdownMenu,
                { top: 50 + (insets.top > 0 ? insets.top : 0) },
              ]}
            >
              <View style={styles.dropdownHeader}>
                <Icon name="account-circle" size={40} color="#4CAF50" />
                <View style={styles.dropdownUserInfo}>
                  <Text style={styles.dropdownUserName}>{user?.name}</Text>
                  <Text style={styles.dropdownUserEmail}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.dropdownDivider} />
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setShowDropdown(false);
                  router.push("/profile");
                }}
              >
                <Icon name="person" size={20} color="#555" />
                <Text style={styles.dropdownItemText}>Profil Saya</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setShowDropdown(false);
                  router.push("/orders");
                }}
              >
                <Icon name="receipt" size={20} color="#555" />
                <Text style={styles.dropdownItemText}>Pesanan Saya</Text>
              </TouchableOpacity>
              {user?.role === "admin" && (
                <>
                  <View style={styles.dropdownDivider} />
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShowDropdown(false);
                      router.push("/admin");
                    }}
                  >
                    <Icon name="dashboard" size={20} color="#555" />
                    <Text style={styles.dropdownItemText}>Dashboard Admin</Text>
                  </TouchableOpacity>
                </>
              )}
              <View style={styles.dropdownDivider} />
              <TouchableOpacity
                style={[styles.dropdownItem, styles.dropdownLogout]}
                onPress={handleLogout}
              >
                <Icon name="logout" size={20} color="#ff4444" />
                <Text style={styles.dropdownLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <HomeHeader />,
        headerStyle: {
          backgroundColor: "#FFFFFF",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        },
        tabBarStyle: {
          backgroundColor: "#FFF",
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 0,
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Icon name="restaurant-menu" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />

      {/* HIDDEN SCREENS */}
      <Tabs.Screen name="cart" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="addresses" options={{ href: null }} />
      <Tabs.Screen name="detail/[id]" options={{ href: null }} />
      <Tabs.Screen name="maps" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerCartButton: { position: "relative", padding: 4 },
  headerCartBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  headerCartBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  headerUserButton: { padding: 4 },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 999,
  },
  dropdownMenu: {
    position: "absolute",
    right: 10,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 220,
    zIndex: 1000,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  dropdownUserInfo: { flex: 1 },
  dropdownUserName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  dropdownUserEmail: { fontSize: 11, color: "#888", marginTop: 2 },
  dropdownDivider: { height: 1, backgroundColor: "#F0F0F0" },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dropdownItemText: { fontSize: 14, color: "#555" },
  dropdownLogout: { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  dropdownLogoutText: { fontSize: 14, color: "#ff4444" },
});
