import React from "react";
import { Stack } from "expo-router";

const RegisterLayout = () => {
  // Layout for registration screens - handles owner and employee registration flows
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="owner" />
      <Stack.Screen name="employee" />
    </Stack>
  );
};

export default RegisterLayout;