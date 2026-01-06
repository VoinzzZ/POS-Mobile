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
  // const [timeLeft, setTimeLeft] = useState(600); // MOVED TO COMPONENT
  const [resendTrigger, setResendTrigger] = useState(0); // New trigger
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

  // Timer countdown isolated in Component
  const handleTimeUp = React.useCallback(() => {
    setCanResend(true);
  }, []);

  // OTP handlers
  const handleOtpChange = React.useCallback((value: string, index: number) => {
    setOtpCode((prev) => {
      const newOtpCode = [...prev];
      newOtpCode[index] = value;
      return newOtpCode;
    });

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = React.useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otpCode]);

  const handleVerifyOtp = React.useCallback(async (code?: string) => {
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
  }, [otpCode, params, confirmEmailVerification, router]);

  const handleResendOtp = React.useCallback(async () => {
    // We need current state of canResend and resendLoading, but they change over time.
    // However, this function is called from a button that might be re-rendered.
    // If we include them in deps, the function recreation might still trigger child re-renders if passed down.
    // But since we are extracting OTP inputs which don't use this, it might be fine.
    // Let's passed the values from the component processing the click if possible or accept some re-creation.
    // Wait, the OTP component doesn't use handleResendOtp. The parent does.
    // Actually, EmailVerificationContent receives it.
    // Let's implement it with refs for values if we want absolute stability or just standard deps.
    // Standard deps are fine as long as the OTP Input component (which is separate) doesn't receive it.
    // But EmailVerificationContent DOES receive it.
    // If EmailVerificationContent re-renders, does it destroy the OTP inputs?
    // Not if the OTP inputs are in a React.memo component.

    // So standard implementation here is fine.

    // NOTE: The original implementation accessed state directly. 
    // We will use a ref-based approach or just standard state access. 
    // Since `canResend` changes infrequently (only when timer hits 0), it's fine.

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

      setResendTrigger(prev => prev + 1);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke email Anda.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mengirim ulang kode OTP. Silakan coba lagi.');
    } finally {
      setResendLoading(false);
    }
  }, [canResend, resendLoading, params, sendOwnerEmailVerification]);

  const handlePasteOtp = React.useCallback((pastedText: string) => {
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      const newOtpCode = digits.split('');
      setOtpCode(newOtpCode);
    }
  }, []);

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
          // timeLeft={timeLeft} REMOVED
          // setTimeLeft={setTimeLeft} REMOVED
          resendTrigger={resendTrigger} // NEW
          onTimeUp={handleTimeUp} // NEW
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