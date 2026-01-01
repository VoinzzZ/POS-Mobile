import React, { useEffect } from "react";
import { View, StyleSheet, ImageBackground, Dimensions } from "react-native";
import LoginForm from "@/src/components/auth/LoginForm";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useRouter } from "expo-router";
import ThemeToggle from "@/src/components/shared/ThemeToggle";
import { useOrientation } from "@/src/hooks/useOrientation";

const LoginScreen = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const userRole = user?.role || user?.user_role;

    if (isAuthenticated && user && userRole) {
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
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);

  const backgroundAsset = theme === "light"
    ? require("../../assets/images/backgroundAuthLight.png")
    : require("../../assets/images/backgroundAuth.png");

  const { isLandscape: isLand, isTablet: isTab, width, height } = useOrientation();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundAsset}
        resizeMode={isLand && isTab ? "cover" : "cover"}
        style={[styles.background, isLand && isTab ? { width: width, height: height } : {}]}
      >
        <ThemeToggle />
        <View style={[styles.overlay, isLand && isTab ? styles.landscapeOverlay : {}]}>
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
  landscapeOverlay: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
});

export default LoginScreen;
