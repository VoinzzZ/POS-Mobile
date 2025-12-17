import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ImageBackground, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '@/src/components/shared/ThemeToggle';
import EmailVerificationContent from '@/src/components/auth/owner/EmailVerificationContent';

export default function OwnerVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, theme } = useTheme();
  const { confirmEmailVerification, sendOwnerEmailVerification } = useAuth();

  // OTP states
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>(Array(6).fill(null));

  const handleBackToData = () => {
    router.push('/auth/register/owner/data');
  };

  // Set transparent StatusBar for auth screen
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    StatusBar.setBackgroundColor("transparent");
    StatusBar.setTranslucent(true);
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // OTP handlers
  const handleOtpChange = (value: string, index: number) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const finalCode = code || otpCode.join('');

    if (finalCode.length !== 6) {
      Alert.alert('Error', 'Masukkan kode OTP 6 digit');
      return;
    }

    setLoading(true);
    try {
      await confirmEmailVerification(parseInt(params.registration_id as string), finalCode);

      const combinedData = {
        ...params,
        otp_code: finalCode,
      };

      router.push({
        pathname: '/auth/register/owner/password',
        params: combinedData
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Kode OTP tidak valid. Silakan coba lagi.');
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resendLoading) return;

    setResendLoading(true);
    try {
      const requestData = {
        registration_id: parseInt(params.registration_id as string),
        user_email: params.user_email as string,
        user_name: params.user_name as string,
        user_full_name: params.user_full_name as string,
        user_phone: params.user_phone as string,
      };

      await sendOwnerEmailVerification(requestData);

      setTimeLeft(600);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke email Anda.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mengirim ulang kode OTP. Silakan coba lagi.');
    } finally {
      setResendLoading(false);
    }
  };

  const handlePasteOtp = (pastedText: string) => {
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      const newOtpCode = digits.split('');
      setOtpCode(newOtpCode);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const backgroundAsset = theme === "light"
    ? require("../../../../assets/images/backgroundAuthLight.png")
    : require("../../../../assets/images/backgroundAuth.png");

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundAsset}
        resizeMode="cover"
        style={styles.background}
      >
        {/* Theme Toggle - Top Right Corner */}
        <ThemeToggle />

        <EmailVerificationContent
          colors={colors}
          otpCode={otpCode}
          setOtpCode={setOtpCode}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
          canResend={canResend}
          setCanResend={setCanResend}
          loading={loading}
          setLoading={setLoading}
          resendLoading={resendLoading}
          setResendLoading={setResendLoading}
          params={params}
          router={router}
          confirmEmailVerification={confirmEmailVerification}
          sendOwnerEmailVerification={sendOwnerEmailVerification}
          inputRefs={inputRefs}
          handleOtpChange={handleOtpChange}
          handleKeyPress={handleKeyPress}
          handleVerifyOtp={handleVerifyOtp}
          handleResendOtp={handleResendOtp}
          handlePasteOtp={handlePasteOtp}
          formatTime={formatTime}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
});