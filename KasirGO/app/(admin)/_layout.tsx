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

  const userRole = user?.role || user?.user_role;

  if (userRole !== "ADMIN" && userRole !== "OWNER") {
    if (userRole === "CASHIER") {
      return <Redirect href="/(cashier)/dashboard" />;
    } else if (userRole === "INVENTORY") {
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
