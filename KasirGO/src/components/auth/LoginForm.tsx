import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import PasswordInput from "../shared/PasswordInput";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface LoginFormProps {}

const LoginForm = (props: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();

  const validateInputs = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email tidak boleh kosong";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Format email tidak valid";
      }
    }
    
    if (!password.trim()) {
      newErrors.password = "Password tidak boleh kosong";
    } else if (password.length < 8) {
      newErrors.password = "Password minimal 8 karakter";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    // Validation
    if (!validateInputs()) {
      return;
    }

    try {
      setIsLoading(true);
      
      // Call login from AuthContext
      await login(email, password);
      
      // Login success - AuthContext will handle the redirect via index.tsx
      // No need to manually redirect here
      
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMsg = error.message || "Email atau password salah. Silakan coba lagi.";
      setErrors({ email: errorMsg });
    } finally {
      setIsLoading(false);
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
    label: {
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
    button: {
      backgroundColor: colors.primary,
    },
    buttonDisabled: {
      backgroundColor: colors.disabled,
    },
    link: {
      color: colors.primary,
    },
  });

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Logo */}
      <Image source={require("../../../assets/images/KasirGOTrnsprt.png")} style={styles.logo} />

      {/* Title */}
      <Text style={[styles.title, dynamicStyles.title]}>MASUK</Text>
      <Text style={[styles.subtitle, dynamicStyles.subtitle]}>Akses Sistem Point-of-Sale Anda</Text>

      {/* Email Input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, dynamicStyles.label]}>Email</Text>
        <View style={[styles.inputWrapper, { borderColor: errors.email ? '#ef4444' : colors.border }]}>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            placeholder="contoh@email.com"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            autoCapitalize="none"
          />
        </View>
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, dynamicStyles.label]}>Password</Text>
        <PasswordInput
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) {
              setErrors({ ...errors, password: undefined });
            }
          }}
          placeholder="Masukkan password"
          hasError={!!errors.password}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* Button Login */}
      <TouchableOpacity
        style={[styles.button, dynamicStyles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.buttonText}>MASUK</Text>
        )}
      </TouchableOpacity>

      {/* Links */}
      <TouchableOpacity onPress={() => console.log("Lupa Password - coming soon")}>
        <Text style={[styles.link, dynamicStyles.link]}>Lupa Password?</Text>
      </TouchableOpacity>
      <Text style={[styles.footer, dynamicStyles.footer]}>
        Belum punya akun?{" "}
        <Text
          style={[styles.linkInline, dynamicStyles.link]}
          onPress={() => router.push("/auth/register")}
        >
          Daftar Sekarang
        </Text>
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
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    alignSelf: "flex-start",
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  link: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
  linkInline: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
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