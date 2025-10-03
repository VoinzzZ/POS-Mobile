import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { ThemeProvider } from "../src/context/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(cashier)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
