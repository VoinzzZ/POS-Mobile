import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MailCheck } from 'lucide-react-native';
import { useRouter } from "expo-router";
import { verifyEmailOTPApi, registerApi } from "../../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

const EmailVerificationForm: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [canResend, setCanResend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string>("");
  const [codeError, setCodeError] = useState<string>("");
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const { colors } = useTheme();

  // Load userId and email from AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("@temp_user_id");
        const storedEmail = await AsyncStorage.getItem("@temp_email");
        
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
        } else {
          Alert.alert("Error", "Data registrasi tidak ditemukan. Silakan daftar ulang.", [
            { text: "OK", onPress: () => router.push("/auth/register") }
          ]);
        }
        
        if (storedEmail) {
          setEmail(storedEmail);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleCodeChange = (value: string, index: number): void => {
    if (!/^\d*$/.test(value)) return;
    
    // Clear error when user starts typing
    if (codeError) {
      setCodeError("");
    }
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number): void => {
    if (key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (): Promise<void> => {
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setCodeError("Silakan masukkan kode 6 digit lengkap");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "Data registrasi tidak valid. Silakan daftar ulang.");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyEmailOTPApi(userId, code);
      
      if (response.success) {
        Alert.alert(
          "Berhasil!", 
          "Email berhasil diverifikasi. Silakan buat password.",
          [{ text: "OK", onPress: () => router.push("/auth/setPassword") }]
        );
      } else {
        Alert.alert("Error", response.message || "Verifikasi gagal");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Terjadi kesalahan saat verifikasi";
      setCodeError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (!canResend || !userId || !email) return;

    setLoading(true);
    try {
      // Get user_name and PIN from AsyncStorage
      const user_name = await AsyncStorage.getItem("@temp_user_name") || email.split('@')[0];
      const pin = await AsyncStorage.getItem("@temp_pin");
      
      if (!pin) {
        Alert.alert("Error", "PIN tidak ditemukan. Silakan daftar ulang.");
        return;
      }

      const response = await registerApi(user_name, pin, email);
      
      if (response.success) {
        setTimeLeft(300);
        setCanResend(false);
        setVerificationCode(['', '', '', '', '', '']);
        Alert.alert('Berhasil', 'Kode verifikasi baru telah dikirim ke email Anda');
      } else {
        Alert.alert("Error", response.message || "Gagal mengirim ulang kode");
      }
    } catch (error: any) {
      console.error("Resend error:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Gagal mengirim ulang kode"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Logo */}
      <Image 
        source={require("../../../assets/images/KasirGOTrnsprt.png")} 
        style={styles.logo} 
      />

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>VERIFIKASI</Text>
      <Text style={[styles.title, { color: colors.text }]}>EMAIL</Text>
      
      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Masukkan kode 6 digit yang telah dikirim ke email Anda{email ? `: ${email}` : ""}
      </Text>

    {/* Email Icon */}
        <View style={styles.emailIconContainer}>
        <View style={[styles.emailIcon, { backgroundColor: colors.primary }]}>
            <MailCheck size={40} color="#ffffff" strokeWidth={2.5} />
        </View>
        </View>


      {/* Code Input Fields */}
      <View style={styles.codeFieldContainer}>
        <View style={styles.codeContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.codeInput,
                codeError && { borderColor: "#ef4444", borderWidth: 2 }
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              placeholderTextColor="#94a3b8"
            />
          ))}
        </View>
        {codeError && (
          <Text style={styles.codeErrorText}>{codeError}</Text>
        )}
      </View>

      {/* Verify Button */}
      <TouchableOpacity 
        style={[styles.verifyButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} 
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.verifyButtonText}>VERIFIKASI</Text>
        )}
      </TouchableOpacity>

      {/* Resend Code */}
      <TouchableOpacity 
        style={styles.resendContainer}
        onPress={handleResendCode}
        disabled={!canResend}
      >
        <Text style={[
          styles.resendText, 
          { color: canResend ? colors.primary : colors.textSecondary },
          !canResend && styles.resendTextDisabled
        ]}>
          {canResend ? 'Kirim Ulang Kode' : `Kirim Ulang Kode (${timeLeft}s)`}
        </Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <Text style={[styles.footer, { color: colors.textSecondary }]}>
        Kembali ke{" "}
        <Text style={[styles.link, { color: colors.primary }]} onPress={() => router.push("/auth/login")}>
          Login
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#1e293b",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 200,
    height: 60,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffff",
    textAlign: "center",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 30,
    lineHeight: 20,
  },
  emailIconContainer: {
    marginBottom: 35,
    alignItems: "center",
  },
  emailIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6, 
  },
  codeFieldContainer: {
    width: "100%",
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 20,
    width: "100%",
    gap: 8,
  },
  codeInput: {
    width: 45,
    height: 45,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    fontSize: 20,
    fontWeight: "700",
    color: "#2E3A59",
    backgroundColor: "#FAFAFA",
  },
  verifyButton: {
    width: "100%",
    backgroundColor: "#4ECDC4",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: "#4ECDC4",
    textDecorationLine: "underline",
  },
  resendTextDisabled: {
    color: "#CCCCCC",
    textDecorationLine: "none",
  },
  footer: {
    color: "#94a3b8",
    fontSize: 14,
  },
  link: {
    color: "#4ECDC4",
    fontWeight: "500",
  },
  codeErrorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
});

export default EmailVerificationForm;
