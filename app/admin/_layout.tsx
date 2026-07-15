import { Tabs, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../context/AuthContext";

function AdminHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
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

  const navigateToProfile = () => {
    setShowDropdown(false);
    router.push("/profile");
  };

  const navigateToEditProfile = () => {
    setShowDropdown(false);
    router.push("/edit-profile");
  };

  return (
    <View
      style={[styles.headerContainer, { paddingTop: insets.top > 0 ? 8 : 8 }]}
    >
      <TouchableOpacity
        onPress={() => {
          setShowDropdown(false);
          router.push("/admin");
        }}
        activeOpacity={0.7}
        style={styles.logoContainer}
      >
        <Text style={styles.headerTitle}>Dashboard Admin</Text>
      </TouchableOpacity>

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => setShowDropdown((prev) => !prev)}
          style={styles.avatarButton}
        >
          <Icon name="account-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>

        {showDropdown && (
          <>
            <TouchableOpacity
              style={styles.dropdownOverlay}
              activeOpacity={1}
              onPress={() => setShowDropdown(false)}
            />
            <View
              style={[
                styles.dropdownMenu,
                { top: 48 + (insets.top > 0 ? insets.top : 0) },
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
                onPress={navigateToEditProfile}
              >
                <Icon name="edit" size={20} color="#555" />
                <Text style={styles.dropdownItemText}>Edit Profil</Text>
              </TouchableOpacity>
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

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <AdminHeader />,
        headerStyle: {
          backgroundColor: "#FFF",
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        },
        headerTintColor: "#333",
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="order/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Icon name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
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
    paddingVertical: 10,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerRight: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  avatarButton: {
    padding: 4,
  },
  dropdownOverlay: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 280,
    height: 400,
    zIndex: 0,
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    width: 220,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dropdownUserInfo: {
    marginLeft: 10,
    flex: 1,
  },
  dropdownUserName: {
    fontWeight: "bold",
    color: "#333",
  },
  dropdownUserEmail: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 8,
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  dropdownLogout: {
    marginTop: 4,
  },
  dropdownLogoutText: {
    color: "#ff4444",
    fontWeight: "600",
  },
});
