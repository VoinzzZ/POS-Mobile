import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import SetPasswordForm from "@/src/components/form/SetPasswordForm";

const SetPasswordScreen = () => {
  return (
    <ImageBackground
    source={require('../../assets/images/backgroundAuth.png')}
    resizeMode="cover"
    style={styles.background}
    >
      <View style={styles.overlay}>
        < SetPasswordForm/>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default SetPasswordScreen;
