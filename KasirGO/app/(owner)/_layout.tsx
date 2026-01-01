import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function OwnerLayout() {
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

  if (userRole !== "OWNER") {
    if (userRole === "ADMIN") {
      return <Redirect href="/(admin)/dashboard" />;
    } else if (userRole === "CASHIER") {
      return <Redirect href="/(cashier)/dashboard" />;
    }
    return <Redirect href="/auth/login" />;
  }

  // User is authenticated and is OWNER
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="store" />
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