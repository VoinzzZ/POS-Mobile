import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register/index" />
      <Stack.Screen name="registerSelectType" />
      <Stack.Screen name="register/owner/index" />
      <Stack.Screen name="register/owner/data" />
      <Stack.Screen name="register/owner/completion" />
      <Stack.Screen name="register/employee/index" />
      <Stack.Screen name="register/employee/data" />
      <Stack.Screen name="register/employee/verify" />
      <Stack.Screen name="register/employee/password" />
      <Stack.Screen name="register/employee/completion" />
    </Stack>
  );
}
