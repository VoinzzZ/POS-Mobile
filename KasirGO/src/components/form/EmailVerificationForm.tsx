import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { MailCheck } from 'lucide-react-native';
import { useRouter } from "expo-router";

const EmailVerificationForm: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();

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

  const handleVerify = (): void => {
    router.push("/auth/setPassword");
  };

  const handleResendCode = (): void => {
    if (canResend) {
      setTimeLeft(60);
      setCanResend(false);
      setVerificationCode(['', '', '', '', '', '']);
      Alert.alert('Info', 'Verification code has been resent');
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image 
        source={require("../../../assets/images/KasirGOTrnsprt.png")} 
        style={styles.logo} 
      />

      {/* Title */}
      <Text style={styles.title}>EMAIL</Text>
      <Text style={styles.title}>VERIFICATION</Text>
      
      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Please enter 6 6-digit code sent to your email
      </Text>

    {/* Email Icon */}
        <View style={styles.emailIconContainer}>
        <View style={styles.emailIcon}>
            <MailCheck size={40} color="#1e293b" strokeWidth={2.5} />
        </View>
        </View>


      {/* Code Input Fields */}
      <View style={styles.codeContainer}>
        {verificationCode.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.codeInput}
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

      {/* Verify Button */}
      <TouchableOpacity 
        style={styles.verifyButton} 
        onPress={handleVerify}
      >
        <Text style={styles.verifyButtonText}>VERIFY</Text>
      </TouchableOpacity>

      {/* Resend Code */}
      <TouchableOpacity 
        style={styles.resendContainer}
        onPress={handleResendCode}
        disabled={!canResend}
      >
        <Text style={[
          styles.resendText, 
          !canResend && styles.resendTextDisabled
        ]}>
          {canResend ? 'Resend Code' : `Resend Code (${timeLeft}s)`}
        </Text>
      </TouchableOpacity>

      {/* Back to Login */}
      <Text style={styles.footer}>
        Back to{" "}
        <Text style={styles.link} onPress={() => router.push("/auth/login")}>
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 35,
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
});

export default EmailVerificationForm;