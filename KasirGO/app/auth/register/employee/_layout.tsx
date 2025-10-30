import React from "react";
import { Stack } from "expo-router";

const EmployeeRegisterLayout = () => {
  // Layout for employee registration flow
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="data" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="password" />
      <Stack.Screen name="completion" />
    </Stack>
  );
};

export default EmployeeRegisterLayout;