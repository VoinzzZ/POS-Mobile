import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import EmailVerificationForm from "../../src/components/form/EmailVerificationForm";

export default function EmailVerification() {
  return (
    <ImageBackground
      source={require("../../assets/images/backgroundAuth.png")}
      resizeMode="cover"
      style={styles.background}
    >
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
  }
});