import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import PasswordInput from "../shared/PasswordInput";
import { router } from "expo-router";

const LoginForm: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [registPin, setRegistPin] = useState("");
  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../../../assets/images/KasirGOTrnsprt.png")} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>REGISTER</Text>
      <Text style={styles.subtitle}>Access your Point-of-Sale System</Text>

    {/* Username */}
    <View style={styles.inputWrapper}>
    <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={userName}
        onChangeText={setUserName}
        autoComplete="username"
        textContentType="username" // iOS only
        keyboardType="default"
    />
    </View>

    {/* Email */}
    <View style={styles.inputWrapper}>
    <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoComplete="email"
        textContentType="emailAddress"
    />
    </View>

    {/* Registration PIN */}
    <View style={styles.inputWrapper}>
    <TextInput
        style={styles.input}
        placeholder="Registration PIN"
        placeholderTextColor="#aaa"
        keyboardType="number-pad"
        value={registPin}
        onChangeText={setRegistPin}
        autoComplete="off"
        textContentType="oneTimeCode"
    />
    </View>


      {/* Button Login */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/auth/emailVerification')}>
        <Text style={styles.buttonText}>REGIST</Text>
      </TouchableOpacity>

      {/* Links */}
      <Text style={styles.footer}>
        Already have an account?{" "}
        <Text style={styles.link} onPress={() => router.push('/auth/login')}>Login Now</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#1e293b", // bg-slate-800
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 20,
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    color: "white",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  link: {
    color: "#4ECDC4",
    marginTop: 10,
  },
  footer: {
    color: "#94a3b8",
    marginTop: 6,
  },
});

export default LoginForm;