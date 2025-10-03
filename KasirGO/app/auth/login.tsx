import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import LoginForm from "../../src/components/form/LoginForm";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to appropriate dashboard
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.replace("/(admin)/dashboard");
      } else if (user.role === "CASHIER") {
        router.replace("/(cashier)/dashboard");
      }
    }
  }, [isAuthenticated, user]);

  return (
    <ImageBackground
      source={require("../../assets/images/backgroundAuth.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.overlay}>
        <LoginForm />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
