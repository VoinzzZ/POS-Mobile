import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Key, ArrowLeft, ArrowRight, Info } from 'lucide-react-native';

interface EmployeeData {
  pin_registration: string;
  user_email: string;
  user_name: string;
  user_full_name: string;
  user_phone: string;
  preferred_role?: string;
}

interface PinRegistrationContentProps {
  onBackToRegisterType: () => void;
}

export default function PinRegistrationContent({ onBackToRegisterType }: PinRegistrationContentProps) {
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    pin_registration: '',
    user_email: '',
    user_name: '',
    user_full_name: '',
    user_phone: '',
  });
  const [errors, setErrors] = useState<Partial<EmployeeData>>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { colors } = useTheme();

  const handleInputChange = (field: keyof EmployeeData, value: string) => {
    setEmployeeData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = async () => {
    // Skip validation for UI testing
    setLoading(true);
    try {
      // Prepare data for next step - PIN will be verified together with user data
      const combinedData = {
        ...employeeData,
      };

      router.push({
        pathname: '/auth/register/employee/data',
        params: combinedData
      } as any);
    } catch (error) {
      Alert.alert('Error', 'Gagal memulai pendaftaran karyawan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Fixed Header - Tidak ikut scroll */}
        <View style={styles.fixedHeader}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <Key size={24} color={colors.secondary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Daftar sebagai Karyawan
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Masukkan PIN dari pemilik toko
              </Text>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
          </View>

          {/* PIN Info Card - Fixed */}
          <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <View style={styles.infoCardHeader}>
              <Info size={20} color={colors.primary} />
              <Text style={[styles.infoCardTitle, { color: colors.primary }]}>
                Informasi PIN
              </Text>
            </View>
            <View style={styles.infoCardList}>
              <View style={styles.infoItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
                  PIN diberikan oleh pemilik toko
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
                  PIN berlaku selama 24 jam
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
                  Satu PIN hanya bisa digunakan sekali
                </Text>
              </View>
              <View style={styles.infoItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
                  Hubungi pemilik toko jika PIN tidak valid
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Scrollable Form */}
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          {/* PIN Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              PIN Registrasi
            </Text>

            <View style={styles.pinInputContainer}>
              <TextInput
                style={[
                  styles.pinInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.pin_registration ? colors.error : colors.border,
                    color: colors.text
                  }
                ]}
                value={employeeData.pin_registration}
                onChangeText={(value) => handleInputChange('pin_registration', value)}
                placeholder="PIN Registrasi"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry={false}
                textAlign="center"
              />
            </View>

            {errors.pin_registration && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.pin_registration}
              </Text>
            )}
          </View>

          {/* Button - Inside ScrollView */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              loading && styles.buttonDisabled,
              { backgroundColor: loading ? colors.disabled : colors.primary }
            ]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={[styles.nextButtonText, { color: colors.background }]}>
              {loading ? 'Memverifikasi...' : 'Verifikasi PIN'}
            </Text>
            <ArrowRight size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>

            </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: 80,
  },
  keyboardAvoid: {
    flex: 1,
  },
  fixedHeader: {
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 16,
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
    marginBottom: 20,
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
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  pinInputContainer: {
    marginBottom: 16,
  },
  pinInput: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 20,
    letterSpacing: 3,
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
    nextButton: {
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
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});