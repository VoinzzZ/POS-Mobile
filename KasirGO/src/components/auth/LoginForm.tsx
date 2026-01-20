import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Dimensions } from "react-native";
import PasswordInput from "../shared/PasswordInput";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useOrientation } from "../../hooks/useOrientation";

interface LoginFormProps { }

const LoginForm = (props: LoginFormProps) => {
  const { isLandscape: isLand, isTablet: isTab } = useOrientation();
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

      // Login success - AuthContext state will update and trigger redirect
      // The login screen useEffect will handle the redirect

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

  // Determine styling based on orientation and device type
  // Only use larger styles when it's a tablet in landscape mode
  const shouldUseLargerStyles = isTab && isLand;

  return (
    <View style={[styles.container, shouldUseLargerStyles && styles.landscapeContainer, dynamicStyles.container]}>
      {/* Logo */}
      <Image
        source={require("../../../assets/images/KasirGOTrnsprt.png")}
        style={[styles.logo, shouldUseLargerStyles && styles.landscapeLogo]}
      />

      {/* Title */}
      <Text style={[styles.title, shouldUseLargerStyles && styles.landscapeTitle, dynamicStyles.title]}>MASUK</Text>
      <Text style={[styles.subtitle, shouldUseLargerStyles && styles.landscapeSubtitle, dynamicStyles.subtitle]}>Akses Sistem Point-of-Sale Anda</Text>

      {/* Email Input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, shouldUseLargerStyles && styles.landscapeLabel, dynamicStyles.label]}>Email</Text>
        <View style={[styles.inputWrapper, shouldUseLargerStyles && styles.landscapeInputWrapper, { borderColor: errors.email ? '#ef4444' : colors.border }]}>
          <TextInput
            style={[styles.input, shouldUseLargerStyles && styles.landscapeInput, dynamicStyles.input]}
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
          <Text style={[styles.errorText, shouldUseLargerStyles && styles.landscapeErrorText]}>{errors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, shouldUseLargerStyles && styles.landscapeLabel, dynamicStyles.label]}>Password</Text>
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
          <Text style={[styles.errorText, shouldUseLargerStyles && styles.landscapeErrorText]}>{errors.password}</Text>
        )}
      </View>

      {/* Button Login */}
      <TouchableOpacity
        style={[styles.button, shouldUseLargerStyles && styles.landscapeButton, dynamicStyles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size={shouldUseLargerStyles ? "large" : "small"} color="white" />
        ) : (
          <Text style={[styles.buttonText, shouldUseLargerStyles && styles.landscapeButtonText]}>MASUK</Text>
        )}
      </TouchableOpacity>

      {/* Links */}
      <TouchableOpacity onPress={() => console.log("Lupa Password - coming soon")}>
        <Text style={[styles.link, shouldUseLargerStyles && styles.landscapeLink, dynamicStyles.link]}>Lupa Password?</Text>
      </TouchableOpacity>
      <Text style={[styles.footer, shouldUseLargerStyles && styles.landscapeFooter, dynamicStyles.footer]}>
        Belum punya akun?{" "}
        <Text
          style={[styles.linkInline, shouldUseLargerStyles && styles.landscapeLinkInline, dynamicStyles.link]}
          onPress={() => router.push("/auth/registerSelectType")}
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
  landscapeContainer: {
    maxWidth: 500,
    padding: 32,
    gap: 16,
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
  landscapeLogo: {
    width: 250,
    height: 125,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  landscapeTitle: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  landscapeSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  landscapeLabel: {
    fontSize: 18,
    marginBottom: 10,
  },
  inputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
  },
  landscapeInputWrapper: {
    borderRadius: 12,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  landscapeInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  landscapeButton: {
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 16,
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
  landscapeButtonText: {
    fontSize: 20,
  },
  link: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
  landscapeLink: {
    marginTop: 14,
    fontSize: 16,
  },
  linkInline: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
  landscapeLinkInline: {
    fontSize: 16,
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
  landscapeFooter: {
    marginTop: 10,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  landscapeErrorText: {
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default LoginForm;