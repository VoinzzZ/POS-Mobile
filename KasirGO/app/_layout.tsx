import React from "react";
import { Stack, Redirect } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function RootStack() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (user.role === "ADMIN") {
    return <Redirect href="/(admin)/dashboard" />;
  } else if (user.role === "CASHIER") {
    return <Redirect href="/(cashier)/dashboard" />;
  }

  // Default fallback
  return <Redirect href="/auth/login" />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
