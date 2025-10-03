import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from "react-native";
import PasswordInput from "../shared/PasswordInput";
import { useRouter } from "expo-router";

interface LoginFormProps {}

const LoginForm = (props: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      alert("Email & Password wajib diisi");
      return;
    }
    console.log("Email:", email);
    console.log("Password:", password);
    // nanti bisa tambahkan API call di sini
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../../../assets/images/KasirGOTrnsprt.png")} style={styles.logo} />

      {/* Title */}
      <Text style={styles.title}>LOGIN</Text>
      <Text style={styles.subtitle}>Access your Point-of-Sale System</Text>

      {/* Email Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <PasswordInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
      />

      {/* Button Login */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* Links */}
      <TouchableOpacity>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      <Text style={styles.footer}>
        Don’t have an account?{" "}
        <Text style={styles.link} onPress={() => router.push("/auth/register")}>Register Now</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#1e293b",
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