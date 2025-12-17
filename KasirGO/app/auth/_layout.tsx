import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="registerSelectType" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
