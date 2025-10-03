import React from "react";
import { View, StyleSheet, ImageBackground, Alert } from "react-native";
import LoginForm from "../../src/components/form/LoginForm";
import { useAuth } from "../../src/context/AuthContext";
import { Redirect } from "expo-router";

const LoginScreen = () => {
  const { user } = useAuth();

  if (user) {
    return <Redirect href={user.role === "ADMIN" ? "/(admin)/dashboard" : "/(cashier)/dashboard"} />;
  }

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
