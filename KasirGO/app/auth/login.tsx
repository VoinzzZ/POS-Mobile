import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
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
    // Only redirect when user is authenticated AND user has role data
    // Check both 'role' and 'user_role' properties for compatibility
    const userRole = user?.role || user?.user_role;

    if (isAuthenticated && user && userRole) {
      console.log("🔄 Redirecting to dashboard - Role:", userRole);

      // Add small delay to ensure state is properly updated
      const timer = setTimeout(() => {
        switch (userRole) {
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
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);
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
