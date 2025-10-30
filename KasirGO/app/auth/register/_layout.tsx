import React from "react";
import { Stack } from "expo-router";

const RegisterLayout = () => {
  // Layout for registration screens - no automatic redirect needed
  // Navigation will be handled by the individual screens and user actions
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="registerSelectType" />
      <Stack.Screen name="owner" />
      <Stack.Screen name="employee" />
    </Stack>
  );
};

export default RegisterLayout;