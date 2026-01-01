import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowRight, Info } from 'lucide-react-native';
import { confirmEmailOtpApi } from '@/src/api/auth';

interface EmployeeEmailVerificationContentProps {
  colors: any;
  params: any;
  router: any;
}

export default function EmployeeEmailVerificationContent({ colors, params, router }: EmployeeEmailVerificationContentProps) {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otpCode];

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all fields are filled
    if (newOtp.every(digit => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
      // Move to previous input if backspace is pressed on empty field
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
      // Call API to verify OTP
      const registrationId = params.registration_id || params.user_id;
      if (!registrationId) {
        throw new Error('Registration ID tidak ditemukan');
      }

      const response = await confirmEmailOtpApi(registrationId, finalCode);

      if (response.success) {
        // Combine all data for next step
        const combinedData = {
          ...params,
          otp_code: finalCode,
        };

        router.push({
          pathname: '/auth/register/employee/password',
          params: combinedData
        });
      } else {
        throw new Error(response.message || 'Kode OTP tidak valid');
      }
    } catch (error: any) {
      let errorMessage = 'Kode OTP tidak valid. Silakan coba lagi.';

      // Extract more specific error message from response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
      // Clear OTP inputs on error
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
      // TODO: Implement API call to resend OTP
      // Currently, this only resets the timer locally
      // Backend API for resending OTP needs to be implemented
      setTimeLeft(600); // Reset timer to 10 minutes
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke email Anda.');
    } catch (error) {
      Alert.alert('Error', 'Gagal mengirim ulang kode OTP. Silakan coba lagi.');
    } finally {
      setResendLoading(false);
    }
  };

  const handlePasteOtp = (pastedText: string) => {
    const numbers = pastedText.replace(/\D/g, '').slice(0, 6);
    const newOtp = numbers.split('').concat(Array(6 - numbers.length).fill(''));
    setOtpCode(newOtp);

    // Focus on the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (newOtp.every(digit => digit !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
            <Mail size={24} color={colors.secondary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Verifikasi Email
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Masukkan kode OTP yang telah dikirim ke email Anda
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
        <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
      </View>

      {/* Email Info Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
        <View style={styles.infoCardHeader}>
          <Info size={20} color={colors.primary} />
          <Text style={[styles.infoCardTitle, { color: colors.primary }]}>
            Informasi Verifikasi
          </Text>
        </View>
        <View style={styles.infoCardList}>
          <View style={styles.infoItem}>
            <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
            <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
              Kode OTP dikirim ke email: {params.user_email || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
            <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
              Kode berlaku selama 10 menit
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
            <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
              Periksa folder spam jika tidak menerima email
            </Text>
          </View>
        </View>
      </View>

      {/* OTP Input Section */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Kode OTP
        </Text>

        <View style={styles.otpContainer}>
          {otpCode.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry={false}
              textAlign="center"
              autoFocus={index === 0}
            />
          ))}
        </View>
      </View>

      {/* Timer Section */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: colors.textSecondary }]}>
          Kirim ulang kode dalam {formatTime(timeLeft)}
        </Text>
        <TouchableOpacity
          style={[
            styles.resendButton,
            canResend && !resendLoading && styles.resendButtonActive,
            {
              backgroundColor: canResend && !resendLoading ? colors.primary : colors.disabled,
              borderColor: canResend && !resendLoading ? colors.primary : colors.border
            }
          ]}
          onPress={handleResendOtp}
          disabled={!canResend || resendLoading}
        >
          <Text style={[
            styles.resendButtonText,
            { color: canResend && !resendLoading ? colors.background : colors.textSecondary }
          ]}>
            {resendLoading ? 'Mengirim...' : 'Kirim Ulang'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[
          styles.verifyButton,
          loading && styles.buttonDisabled,
          { backgroundColor: loading ? colors.disabled : colors.primary }
        ]}
        onPress={() => handleVerifyOtp()}
        disabled={loading}
      >
        <Text style={[styles.verifyButtonText, { color: colors.background }]}>
          {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
        </Text>
        <ArrowRight size={20} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressLine: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  infoCardList: {
    gap: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  infoItemText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  otpInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  resendButton: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonActive: {
    // Style will be applied dynamically
  },
  resendButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});