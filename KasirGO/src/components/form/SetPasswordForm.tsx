import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import PasswordInput from "../shared/PasswordInput";
import { useRouter } from "expo-router";
import { setPasswordApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

interface SetPasswordFrom {}

const SetPasswordForm = (props: SetPasswordFrom) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();

  // Load userId from AsyncStorage
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("@temp_user_id");
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
        } else {
          Alert.alert("Error", "Data registrasi tidak ditemukan. Silakan daftar ulang.", [
            { text: "OK", onPress: () => router.push("/auth/register") }
          ]);
        }
      } catch (error) {
        console.error("Error loading userId:", error);
      }
    };
    
    loadUserId();
  }, []);

  const validatePassword = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!password.trim()) {
      newErrors.password = "Password tidak boleh kosong";
    } else if (password.length < 8) {
      newErrors.password = "Password harus minimal 8 karakter";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = "Password harus mengandung huruf besar, kecil, dan angka";
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Konfirmasi password tidak boleh kosong";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Password dan konfirmasi tidak cocok";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSetPassword = async () => {
    if (!validatePassword()) return;

    if (!userId) {
      Alert.alert("Error", "Data registrasi tidak valid. Silakan daftar ulang.");
      return;
    }

    setLoading(true);
    try {
      const response = await setPasswordApi(userId, password);
      
      if (response.success && response.data) {
        // Save tokens and user data
        const { user, tokens } = response.data;
        await login(user, tokens.access_token, tokens.refresh_token);
        
        // Clean up temporary data
        await AsyncStorage.multiRemove([
          "@temp_user_id",
          "@temp_email",
          "@temp_pin",
          "@temp_user_name"
        ]);
        
        Alert.alert(
          "Registrasi Berhasil!", 
          "Akun Anda telah berhasil dibuat. Selamat datang di KasirGO!",
          [{ 
            text: "OK", 
            onPress: () => {
              // Navigate based on role
              if (user.user_role === "ADMIN") {
                router.replace("/(admin)");
              } else {
                router.replace("/(cashier)");
              }
            }
          }]
        );
      } else {
        Alert.alert("Error", response.message || "Gagal membuat password");
      }
    } catch (error: any) {
      console.error("Set password error:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Terjadi kesalahan saat membuat password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Logo */}
      <Image source={require("../../../assets/images/KasirGOTrnsprt.png")} style={styles.logo} />

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>Buat Password</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Akses Sistem Kasir Anda</Text>

      {/* Password Input */}
      <View style={styles.fieldContainer}>
        <PasswordInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) {
              setErrors({ ...errors, password: undefined });
            }
          }}
          placeholder="Password"
          hasError={!!errors.password}
        />
        {errors.password && (
          <Text style={[styles.errorText, { color: "#ef4444" }]}>{errors.password}</Text>
        )}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.fieldContainer}>
        <PasswordInput
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              setErrors({ ...errors, confirmPassword: undefined });
            }
          }}
          placeholder="Konfirmasi Password"
          hasError={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <Text style={[styles.errorText, { color: "#ef4444" }]}>{errors.confirmPassword}</Text>
        )}
      </View>

      {/* Button Create Account */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleSetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Buat Akun</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.footer, { color: colors.textSecondary }]}>
        Sudah punya akun?{" "}
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push("/auth/login")}>Masuk Sekarang</Text>
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
    gap: 12,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 4,
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default SetPasswordForm;