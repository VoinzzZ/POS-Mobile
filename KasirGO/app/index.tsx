import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Role-based redirect
      if (user.role === "ADMIN") {
        router.replace("/(admin)/dashboard");
      } else if (user.role === "CASHIER") {
        router.replace("/(cashier)/dashboard");
      } else {
        // Unknown role, logout
        router.replace("/auth/login");
      }
    }
  }, [isLoading, isAuthenticated, user]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Authenticated but still processing redirect
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ECDC4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
});
