import React from "react";
import { View, StyleSheet, ImageBackground } from "react-native";
import RegisterForm from "../../src/components/form/RegisterFrom";

const RegisterScreen = () => {
  return (
    <ImageBackground
    source={require('../../assets/images/backgroundAuth.png')}
    resizeMode="cover"
    style={styles.background}
    >
      <View style={styles.overlay}>
        < RegisterForm/>
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

export default RegisterScreen;
