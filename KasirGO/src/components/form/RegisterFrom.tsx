import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { registerApi } from "../../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginForm: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [registPin, setRegistPin] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    userName?: string;
    email?: string;
    pin?: string;
  }>({});
  const { colors } = useTheme();

  const validateInputs = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!userName.trim()) {
      newErrors.userName = "Nama pengguna tidak boleh kosong";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email tidak boleh kosong";
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Format email tidak valid";
      }
    }
    
    if (!registPin.trim()) {
      newErrors.pin = "PIN registrasi tidak boleh kosong";
    } else if (registPin.length !== 6) {
      newErrors.pin = "PIN registrasi harus 6 digit";
    } else if (!/^\d{6}$/.test(registPin)) {
      newErrors.pin = "PIN hanya boleh berisi angka";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const response = await registerApi(userName.trim(), registPin.trim(), email.trim());
      
      if (response.success && response.data?.userId) {
        // Save userId, email, and PIN for next steps
        await AsyncStorage.setItem("@temp_userId", response.data.userId.toString());
        await AsyncStorage.setItem("@temp_email", email.trim());
        await AsyncStorage.setItem("@temp_pin", registPin.trim());
        await AsyncStorage.setItem("@temp_userName", userName.trim());
        
        Alert.alert(
          "Berhasil!", 
          "Kode OTP telah dikirim ke email Anda. Silakan periksa inbox Anda.",
          [{ text: "OK", onPress: () => router.push("/auth/emailVerification") }]
        );
      } else {
        Alert.alert("Error", response.message || "Registrasi gagal");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Terjadi kesalahan saat registrasi"
      );
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    input: {
      color: colors.text,
    },
    title: {
      color: colors.text,
    },
    subtitle: {
      color: colors.textSecondary,
    },
    footer: {
      color: colors.textSecondary,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Logo */}
      <Image source={require("../../../assets/images/KasirGOTrnsprt.png")} style={styles.logo} />

      {/* Title */}
      <Text style={[styles.title, dynamicStyles.title]}>DAFTAR</Text>
      <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Buat Akun Sistem POS Anda</Text>

    {/* Username */}
    <View style={styles.fieldContainer}>
      <View style={[styles.inputWrapper, { borderColor: errors.userName ? '#ef4444' : colors.border }]}>
        <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder="Nama Pengguna"
            placeholderTextColor={colors.textSecondary}
            value={userName}
            onChangeText={(text) => {
              setUserName(text);
              if (errors.userName) {
                setErrors({ ...errors, userName: undefined });
              }
            }}
            autoComplete="username"
            textContentType="username"
            keyboardType="default"
        />
      </View>
      {errors.userName && (
        <Text style={styles.errorText}>{errors.userName}</Text>
      )}
    </View>

    {/* Email */}
    <View style={styles.fieldContainer}>
      <View style={[styles.inputWrapper, { borderColor: errors.email ? '#ef4444' : colors.border }]}>
        <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            autoComplete="email"
            textContentType="emailAddress"
            autoCapitalize="none"
        />
      </View>
      {errors.email && (
        <Text style={styles.errorText}>{errors.email}</Text>
      )}
    </View>

    {/* Registration PIN */}
    <View style={styles.fieldContainer}>
      <View style={[styles.inputWrapper, { borderColor: errors.pin ? '#ef4444' : colors.border }]}>
        <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder="PIN Registrasi (6 digit)"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            value={registPin}
            onChangeText={(text) => {
              setRegistPin(text);
              if (errors.pin) {
                setErrors({ ...errors, pin: undefined });
              }
            }}
            autoComplete="off"
            textContentType="oneTimeCode"
            maxLength={6}
        />
      </View>
      {errors.pin && (
        <Text style={styles.errorText}>{errors.pin}</Text>
      )}
    </View>


      {/* Button Register */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>DAFTAR</Text>
        )}
      </TouchableOpacity>

      {/* Links */}
      <Text style={[styles.footer, dynamicStyles.footer]}>
        Sudah punya akun?{" "}
        <Text style={styles.link} onPress={() => router.push('/auth/login')}>Masuk Sekarang</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 350,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
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
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    width: "100%",
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
    marginTop: 6,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default LoginForm;