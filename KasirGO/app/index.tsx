import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasRedirected) {
      if (isAuthenticated && user) {
        setHasRedirected(true);
        // Use setTimeout to avoid redirect during render
        setTimeout(() => {
          if (user.role === "ADMIN") {
            router.replace("/(admin)/dashboard");
          } else if (user.role === "CASHIER") {
            router.replace("/(cashier)/dashboard");
          } else {
            router.replace("/auth/login");
          }
        }, 100);
      } else {
        setHasRedirected(true);
        setTimeout(() => {
          router.replace("/auth/login");
        }, 100);
      }
    }
  }, [isLoading, isAuthenticated, user, hasRedirected]);

  // Show loading while processing
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4ECDC4" />
      <Text style={styles.text}>Loading...</Text>
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
  text: {
    color: "#94a3b8",
    marginTop: 16,
    fontSize: 16,
  },
});
