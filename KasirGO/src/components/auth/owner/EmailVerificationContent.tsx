import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { Shield, RotateCcw } from 'lucide-react-native';

interface OwnerEmailVerificationContentProps {
  colors: any;
  otpCode: string[];
  setOtpCode: React.Dispatch<React.SetStateAction<string[]>>;
  // timeLeft: number; // REMOVED
  // setTimeLeft: React.Dispatch<React.SetStateAction<number>>; // REMOVED
  canResend: boolean;
  setCanResend: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resendLoading: boolean;
  setResendLoading: React.Dispatch<React.SetStateAction<boolean>>;
  params: any;
  router: any;
  confirmEmailVerification: any;
  sendOwnerEmailVerification: any;
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleOtpChange: (value: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  handleVerifyOtp: (code?: string) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  handlePasteOtp: (pastedText: string) => void;
  formatTime: (seconds: number) => string;
}


interface OTPInputSectionProps {
  otpCode: string[];
  colors: any;
  inputRefs: React.MutableRefObject<(TextInput | null)[]>;
  handleOtpChange: (value: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  handlePasteOtp: (pastedText: string) => void;
}

const OTPInputSection = React.memo(({
  otpCode,
  colors,
  inputRefs,
  handleOtpChange,
  handleKeyPress,
  handlePasteOtp
}: OTPInputSectionProps) => {
  return (
    <View style={styles.otpInputContainer}>
      {otpCode.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.otpInput,
            {
              backgroundColor: colors.card,
              borderColor: digit ? colors.primary : colors.border,
              color: colors.text,
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
          selectTextOnFocus
          onContentSizeChange={() => {
            // Handle paste event
            if (digit.length > 1) {
              handlePasteOtp(digit);
            }
          }}
        />
      ))}
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to ensure strict equality check for props if needed
  // Usually shallow compare is enough if props are stable
  // checking individual input stability
  return prevProps.otpCode === nextProps.otpCode &&
    prevProps.colors === nextProps.colors &&
    prevProps.handleOtpChange === nextProps.handleOtpChange;
});


interface CountdownTimerProps {
  initialSeconds: number;
  onTimeUp: () => void;
  resetTrigger: number;
  formatTime: (seconds: number) => string;
  colors: any;
}

const CountdownTimer = React.memo(({ initialSeconds, onTimeUp, resetTrigger, formatTime, colors }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [resetTrigger, initialSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  if (timeLeft <= 0) return null;

  return (
    <View style={styles.timerContainer}>
      <Text style={[styles.timerText, { color: colors.textSecondary }]}>
        Kode akan kadaluarsa dalam
      </Text>
      <Text style={[styles.timerValue, { color: colors.primary }]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
});

export default function OwnerEmailVerificationContent({
  colors,
  otpCode,
  setOtpCode,
  canResend,
  setCanResend,
  loading,
  setLoading,
  resendLoading,
  setResendLoading,
  params,
  router,
  confirmEmailVerification,
  sendOwnerEmailVerification,
  inputRefs,
  handleOtpChange,
  handleKeyPress,
  handleVerifyOtp,
  handleResendOtp,
  handlePasteOtp,
  formatTime,
  resendTrigger,
  onTimeUp
}: OwnerEmailVerificationContentProps & { resendTrigger: number, onTimeUp: () => void }) {

  // Real API verification
  const handleVerifyOtpUI = async (code?: string) => {
    const finalCode = code || otpCode.join('');

    if (finalCode.length !== 6) {
      Alert.alert('Error', 'Masukkan kode OTP 6 digit');
      return;
    }

    // Validate registration_id before verification
    if (!params.registration_id || isNaN(parseInt(params.registration_id as string))) {
      Alert.alert(
        'Error Registration',
        'Data registrasi tidak valid. Silakan mulai registrasi dari awal.',
        [
          {
            text: 'Mulai dari Awal',
            onPress: () => router.replace('/auth/registerSelectType')
          }
        ]
      );
      return;
    }

    setLoading(true);
    try {
      const registrationId = parseInt(params.registration_id as string);
      await confirmEmailVerification(registrationId, finalCode);

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
      // Clear OTP inputs on error
      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtpUI = async () => {
    if (!canResend || resendLoading) return;

    // Validate registration_id before resending
    if (!params.registration_id || isNaN(parseInt(params.registration_id as string))) {
      Alert.alert(
        'Error Registration',
        'Data registrasi tidak valid. Silakan mulai registrasi dari awal.',
        [
          {
            text: 'Mulai dari Awal',
            onPress: () => router.replace('/auth/registerSelectType')
          }
        ]
      );
      return;
    }

    setResendLoading(true);
    try {
      const registrationId = parseInt(params.registration_id as string);
      const requestData = {
        registration_id: registrationId,
        user_email: params.user_email as string,
        user_name: params.user_name as string,
        user_full_name: params.user_full_name as string,
        user_phone: params.user_phone as string,
      };

      await sendOwnerEmailVerification(requestData);

      handleResendOtp(); // Call parent handler to update trigger

      setOtpCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      Alert.alert('Berhasil', 'Kode OTP baru telah dikirim ke email Anda.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal mengirim ulang kode OTP. Silakan coba lagi.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust based on header/statusbar
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Shield size={32} color={colors.primary} />
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
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
          </View>

          {/* Email Display */}
          <View style={[styles.emailContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.emailLabel, { color: colors.textSecondary }]}>
              Kode OTP dikirim ke:
            </Text>
            <Text style={[styles.emailText, { color: colors.text }]}>
              {params.user_email || 'email@example.com'}
            </Text>
            <TouchableOpacity
              style={styles.changeEmailButton}
              onPress={() => {
                // Validate registration_id before navigation
                if (!params.registration_id || isNaN(parseInt(params.registration_id as string))) {
                  Alert.alert(
                    'Error Registration',
                    'Data registrasi tidak valid. Silakan mulai registrasi dari awal.',
                    [
                      {
                        text: 'Mulai dari Awal',
                        onPress: () => router.replace('/auth/registerSelectType')
                      }
                    ]
                  );
                  return;
                }

                router.push({
                  pathname: '/auth/register/owner/data',
                  params: params
                });
              }}
            >
              <Text style={[styles.changeEmailText, { color: colors.primary }]}>
                Salah email?
              </Text>
            </TouchableOpacity>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <Text style={[styles.otpLabel, { color: colors.text }]}>
              Masukkan Kode OTP
            </Text>
            <OTPInputSection
              otpCode={otpCode}
              colors={colors}
              inputRefs={inputRefs}
              handleOtpChange={handleOtpChange}
              handleKeyPress={handleKeyPress}
              handlePasteOtp={handlePasteOtp}
            />
          </View>

          {/* Timer */}
          <CountdownTimer
            initialSeconds={600}
            onTimeUp={onTimeUp}
            resetTrigger={resendTrigger}
            formatTime={formatTime}
            colors={colors}
          />



          {/* Resend OTP */}
          {canResend && (
            <TouchableOpacity
              style={[styles.resendButton, { backgroundColor: colors.primary + '10' }]}
              onPress={handleResendOtpUI}
              disabled={resendLoading}
            >
              <RotateCcw size={16} color={colors.primary} />
              <Text style={[styles.resendButtonText, { color: colors.primary }]}>
                {resendLoading ? 'Mengirim...' : 'Kirim Ulang OTP'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
              • Periksa folder spam/promosi jika tidak menerima email{'\n'}
              • Kode OTP berlaku selama 10 menit{'\n'}
              • Jika email salah, klik tombol "Salah email?" di atas{'\n'}
              • Pastikan email yang Anda masukkan dapat diakses
            </Text>
          </View>
        </ScrollView>

        {/* Fixed Verify Button at Bottom */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              styles.fixedButton,
              loading && styles.buttonDisabled,
              { backgroundColor: loading ? colors.disabled : colors.primary }
            ]}
            onPress={() => handleVerifyOtpUI()}
            disabled={loading}
          >
            <Text style={[styles.verifyButtonText, { color: colors.background }]}>
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // justifyContent: 'flex-end', // Removed to allow full screen use
    // paddingTop: 80, // Removed to elliminate empty space
    backgroundColor: 'transparent', // Ensure it doesn't block background
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center', // Center content horizontally on larger screens
    paddingHorizontal: 24,
    justifyContent: 'center', // Keep center but verify scrolling works
    paddingVertical: 20,
    paddingBottom: 150, // Extra padding for fixed button and keyboard space
  },
  header: {
    marginBottom: 24,
    marginTop: 40, // Add some top margin for status bar
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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
  emailContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  emailLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  changeEmailButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeEmailText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textDecorationLine: 'underline',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  timerValue: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  resendButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
  },
  infoCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  verifyButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    padding: 20,
    paddingBottom: 30,
  },
  fixedButton: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});