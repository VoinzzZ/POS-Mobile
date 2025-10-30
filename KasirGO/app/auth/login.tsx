import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground, StatusBar } from "react-native";
import LoginForm from "@/src/components/auth/LoginForm";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import ThemeToggle from "@/src/components/shared/ThemeToggle";

const LoginScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.user_role) {
        case "OWNER":
          router.replace("/(owner)/dashboard");
          break;
        case "ADMIN":
          router.replace("/(admin)/dashboard");
          break;
        case "CASHIER":
          router.replace("/(cashier)/dashboard");
          break;
        case "INVENTORY":
          router.replace("/(inventory)/dashboard");
          break;
      }
    }
  }, [isAuthenticated, user, router]);

  // Set transparent StatusBar for login screen
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
  }, []);
  const backgroundAsset = theme === "light"
    ? require("../../assets/images/backgroundAuthLight.png")
    : require("../../assets/images/backgroundAuth.png");

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundAsset}
        resizeMode="cover"
        style={styles.background}
      >
        <ThemeToggle />
        <View style={styles.overlay}>
          <LoginForm />
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
