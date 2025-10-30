import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function InventoryLayout() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  if (user?.user_role !== "INVENTORY") {
    if (user?.user_role === "OWNER" || user?.user_role === "ADMIN") {
      return <Redirect href="/(admin)/dashboard" />;
    } else if (user?.user_role === "CASHIER") {
      return <Redirect href="/(cashier)/dashboard" />;
    }
    return <Redirect href="/auth/login" />;
  }

  // User is authenticated and is INVENTORY
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="products" />
      <Stack.Screen name="stock" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="brands" />
      <Stack.Screen name="settings" />
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