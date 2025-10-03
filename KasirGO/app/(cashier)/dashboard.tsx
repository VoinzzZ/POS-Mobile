// app/kasir/index.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../src/context/AuthContext";

export default function KasirDashboard() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>
        {user?.role === "KASIR" ? "Kasir" : "Admin"} Dashboard
      </Text>
      <Text style={styles.userInfo}>
        Hello, {user?.name ?? "Guest"} ({user?.email ?? "No Email"})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#1e293b", padding: 20 },
  title: { fontSize: 28, fontWeight: "700", color: "white", marginBottom: 8 },
  subtitle: { fontSize: 18, color: "#4ECDC4", marginBottom: 20 },
  userInfo: { fontSize: 16, color: "#94a3b8" },
});
