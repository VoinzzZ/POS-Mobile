import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Dimensions } from "react-native";
import PasswordInput from "../shared/PasswordInput";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useOrientation } from "../../hooks/useOrientation";

interface LoginFormProps { }

const LoginForm = (props: LoginFormProps) => {
  const { isLandscape: isLand, isTablet: isTab, width: screenWidth, height: screenHeight } = useOrientation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const router = useRouter();
  const { login } = useAuth();
  const { colors, theme } = useTheme();

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

  const isSmallScreen = screenWidth < 375;
  const containerWidth = Math.min(screenWidth * 0.85, 400);
  const landscapeContainerWidth = Math.min(Math.min(screenWidth, screenHeight) * 0.50, 370);

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

  const responsiveStyles = {
    container: {
      width: containerWidth,
      maxWidth: containerWidth,
      padding: isSmallScreen ? 16 : 20,
    },
    landscapeContainer: {
      maxWidth: landscapeContainerWidth,
      padding: screenWidth > 600 ? 14 : 12,
    },
    logo: {
      width: Math.min(screenWidth * 0.45, 180),
      height: Math.min(screenWidth * 0.225, 90),
      marginBottom: isSmallScreen ? 8 : 10,
    },
    landscapeLogo: {
      width: Math.min(screenWidth * 0.15, 120),
      height: Math.min(screenWidth * 0.075, 60),
      marginBottom: 6,
    },
    title: {
      fontSize: isSmallScreen ? 20 : 24,
    },
    landscapeTitle: {
      fontSize: Math.min(screenWidth * 0.024, 20),
      marginBottom: 4,
    },
    subtitle: {
      fontSize: isSmallScreen ? 12 : 14,
      marginBottom: isSmallScreen ? 16 : 20,
    },
    landscapeSubtitle: {
      fontSize: Math.min(screenWidth * 0.013, 12),
      marginBottom: 8,
    },
    label: {
      fontSize: isSmallScreen ? 14 : 16,
    },
    landscapeLabel: {
      fontSize: Math.min(screenWidth * 0.015, 14),
      marginBottom: 6,
    },
    landscapeInput: {
      fontSize: Math.min(screenWidth * 0.014, 13),
      paddingVertical: 8,
    },
    landscapeButton: {
      paddingVertical: 10,
      marginTop: 8,
    },
    landscapeButtonText: {
      fontSize: Math.min(screenWidth * 0.017, 15),
    },
    landscapeLink: {
      fontSize: Math.min(screenWidth * 0.013, 12),
      marginTop: 8,
    },
    landscapeLinkInline: {
      fontSize: Math.min(screenWidth * 0.013, 12),
    },
    landscapeErrorText: {
      fontSize: Math.min(screenWidth * 0.012, 11),
    },
  };

  // Determine styling based on orientation and device type
  // Only use larger styles when it's a tablet in landscape mode
  const shouldUseLargerStyles = isTab && isLand;

  return (
    <View style={[styles.container, responsiveStyles.container, shouldUseLargerStyles && [styles.landscapeContainer, responsiveStyles.landscapeContainer], dynamicStyles.container]}>
      {/* Logo */}
      <Image
        source={require("../../../assets/images/KasirGOTrnsprt.png")}
        style={[styles.logo, responsiveStyles.logo, shouldUseLargerStyles && [styles.landscapeLogo, responsiveStyles.landscapeLogo]]}
      />

      {/* Title */}
      <Text style={[styles.title, responsiveStyles.title, shouldUseLargerStyles && [styles.landscapeTitle, responsiveStyles.landscapeTitle], dynamicStyles.title]}>MASUK</Text>
      <Text style={[styles.subtitle, responsiveStyles.subtitle, shouldUseLargerStyles && [styles.landscapeSubtitle, responsiveStyles.landscapeSubtitle], dynamicStyles.subtitle]}>Akses Sistem Point-of-Sale Anda</Text>

      {/* Email Input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, responsiveStyles.label, shouldUseLargerStyles && [styles.landscapeLabel, responsiveStyles.landscapeLabel], dynamicStyles.label]}>Email</Text>
        <View style={[styles.inputWrapper, shouldUseLargerStyles && styles.landscapeInputWrapper, { borderColor: errors.email ? '#ef4444' : colors.border }]}>
          <TextInput
            style={[styles.input, shouldUseLargerStyles && [styles.landscapeInput, responsiveStyles.landscapeInput], dynamicStyles.input]}
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
          <Text style={[styles.errorText, shouldUseLargerStyles && [styles.landscapeErrorText, responsiveStyles.landscapeErrorText]]}>{errors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.fieldContainer}>
        <Text style={[styles.label, responsiveStyles.label, shouldUseLargerStyles && [styles.landscapeLabel, responsiveStyles.landscapeLabel], dynamicStyles.label]}>Password</Text>
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
          <Text style={[styles.errorText, shouldUseLargerStyles && [styles.landscapeErrorText, responsiveStyles.landscapeErrorText]]}>{errors.password}</Text>
        )}
      </View>

      {/* Button Login */}
      <TouchableOpacity
        style={[styles.button, shouldUseLargerStyles && [styles.landscapeButton, responsiveStyles.landscapeButton], dynamicStyles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size={shouldUseLargerStyles ? "large" : "small"} color="white" />
        ) : (
          <Text style={[styles.buttonText, shouldUseLargerStyles && [styles.landscapeButtonText, responsiveStyles.landscapeButtonText]]}> MASUK</Text>
        )}
      </TouchableOpacity>

      {/* Links */}
      <TouchableOpacity onPress={() => router.push("/auth/forgot-password" as any)}>
        <Text style={[styles.link, shouldUseLargerStyles && [styles.landscapeLink, responsiveStyles.landscapeLink], dynamicStyles.link]}>Lupa Password?</Text>
      </TouchableOpacity>
      <Text style={[styles.footer, shouldUseLargerStyles && styles.landscapeFooter, dynamicStyles.footer]}>
        Belum punya akun?{" "}
        <Text
          style={[styles.linkInline, shouldUseLargerStyles && [styles.landscapeLinkInline, responsiveStyles.landscapeLinkInline], dynamicStyles.link]}
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
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  landscapeContainer: {
    gap: 6,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 4,
  },
  logo: {
    resizeMode: "contain",
  },
  landscapeLogo: {
    marginBottom: 16,
  },
  title: {
    fontWeight: "700",
  },
  landscapeTitle: {
  },
  subtitle: {
  },
  landscapeSubtitle: {
    marginBottom: 24,
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  landscapeLabel: {
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