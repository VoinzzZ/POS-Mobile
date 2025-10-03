import React from "react";
import { View, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";
import EmailVerificationForm from "../../src/components/form/EmailVerificationForm";
import { useTheme } from "../../src/context/ThemeContext";
import { Moon, Sun } from "lucide-react-native";

export default function EmailVerification() {
  const { theme, colors, toggleTheme } = useTheme();

  // Theme toggle button component
  const ThemeToggleButton = () => (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.themeToggle}
    >
      {theme === "dark" ? (
        <Sun size={24} color={colors.primary} />
      ) : (
        <Moon size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  // Light mode - use light background image
  if (theme === "light") {
    return (
      <ImageBackground
        source={require("../../assets/images/backgroundAuthLight.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <ThemeToggleButton />
        <View style={styles.overlay}>
          <EmailVerificationForm />
        </View>
      </ImageBackground>
    );
  }

  // Dark mode - use dark background image
  return (
    <ImageBackground
      source={require("../../assets/images/backgroundAuth.png")}
      resizeMode="cover"
      style={styles.background}
    >
      <ThemeToggleButton />
      <View style={styles.overlay}>
        <EmailVerificationForm />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  themeToggle: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
