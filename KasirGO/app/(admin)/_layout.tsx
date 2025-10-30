import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function AdminLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  if (user?.user_role !== "ADMIN" && user?.user_role !== "OWNER") {
    if (user?.user_role === "CASHIER") {
      return <Redirect href="/(cashier)/dashboard" />;
    } else if (user?.user_role === "INVENTORY") {
      return <Redirect href="/(inventory)/dashboard" />;
    }
    return <Redirect href="/auth/login" />;
  }

  // User is authenticated and is ADMIN
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="products" />
      <Stack.Screen name="history" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="stock" />
      <Stack.Screen name="store" />
    </Stack>
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
