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
import { Key, ArrowLeft, ArrowRight, Info, CheckCircle } from 'lucide-react-native';
import { registerEmployeeWithPinApi, validateEmployeePinApi } from '@/src/api/auth';

interface EmployeeData {
  pin_registration: string;
  user_email: string;
  user_name: string;
  user_full_name: string;
  user_phone: string;
  registration_id?: string; // Added for tracking registration
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
    registration_id: undefined,
  });
  const [errors, setErrors] = useState<Partial<EmployeeData>>({});
  const [loading, setLoading] = useState(false);
  const [pinValidated, setPinValidated] = useState(false);
  const [pinValidationLoading, setPinValidationLoading] = useState(false);
  const [pinInfo, setPinInfo] = useState<{ tenant_name?: string; role_name?: string }>({});

  const router = useRouter();
  const { colors } = useTheme();

  const handleInputChange = (field: keyof EmployeeData, value: string) => {
    setEmployeeData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleValidatePin = async () => {
    // Validate PIN format before making API call
    if (!employeeData.pin_registration || employeeData.pin_registration.length < 6) {
      setErrors({ pin_registration: 'PIN harus 6 digit' });
      return;
    }

    setPinValidationLoading(true);
    try {
      // Call API to validate PIN
      const response = await validateEmployeePinApi(employeeData.pin_registration);

      if (response.success) {
        setPinValidated(true);
        setPinInfo({
          tenant_name: response.data?.tenant_name,
          role_name: response.data?.role_name
        });
        setErrors({ pin_registration: undefined });
      } else {
        throw new Error(response.message || 'PIN tidak valid');
      }
    } catch (error: any) {
      console.error('Error validating PIN:', error);
      let errorMessage = 'PIN tidak valid. Silakan coba lagi.';

      // Extract more specific error message from response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({
        pin_registration: errorMessage
      });
    } finally {
      setPinValidationLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    // Validate all data before making API call
    const newErrors: Partial<EmployeeData> = {};

    if (!employeeData.user_email.trim()) {
      newErrors.user_email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.user_email)) {
      newErrors.user_email = 'Format email tidak valid';
    }

    if (!employeeData.user_name.trim()) {
      newErrors.user_name = 'Nama pengguna wajib diisi';
    } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(employeeData.user_name)) {
      newErrors.user_name = 'Nama pengguna hanya boleh mengandung huruf, angka, dan underscore (3-50 karakter)';
    }

    if (!employeeData.user_full_name.trim()) {
      newErrors.user_full_name = 'Nama lengkap wajib diisi';
    } else if (employeeData.user_full_name.length < 3 || employeeData.user_full_name.length > 100) {
      newErrors.user_full_name = 'Nama lengkap harus 3-100 karakter';
    }

    if (employeeData.user_phone && !/^\+?[0-9]{10,15}$/.test(employeeData.user_phone)) {
      newErrors.user_phone = 'Format nomor telepon tidak valid';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      // Call API to register employee with user data (PIN already validated in phase 1)
      const response = await registerEmployeeWithPinApi({
        pin_registration: employeeData.pin_registration, // Still need to send PIN for backend validation
        user_email: employeeData.user_email,
        user_name: employeeData.user_name,
        user_full_name: employeeData.user_full_name,
        user_phone: employeeData.user_phone,
      });

      if (response.success) {
        // Prepare data for next step - include registration ID from API response
        const combinedData = {
          pin_registration: employeeData.pin_registration,
          user_email: employeeData.user_email,
          user_name: employeeData.user_name,
          user_full_name: employeeData.user_full_name,
          user_phone: employeeData.user_phone,
          registration_id: response.data?.user_id,
          tenant_name: response.data?.tenant_name,
          role_name: response.data?.role_name,
        };

        router.push({
          pathname: '/auth/register/employee/verify',
          params: combinedData
        } as any);
      } else {
        throw new Error(response.message || 'Gagal mendaftar. Silakan coba lagi.');
      }
    } catch (error: any) {
      console.error('Error completing registration:', error);
      let errorMessage = 'Gagal mendaftar. Silakan coba lagi.';

      // Extract more specific error message from response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
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
          {/* PIN Section - Shown when PIN not yet validated */}
          {!pinValidated && (
            <>
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
                    editable={!pinValidationLoading}
                  />
                </View>

                {errors.pin_registration && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.pin_registration}
                  </Text>
                )}
              </View>

              {/* Validate PIN Button */}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  pinValidationLoading && styles.buttonDisabled,
                  { backgroundColor: pinValidationLoading ? colors.disabled : colors.primary }
                ]}
                onPress={handleValidatePin}
                disabled={pinValidationLoading}
              >
                <Text style={[styles.nextButtonText, { color: colors.background }]}>
                  {pinValidationLoading ? 'Memvalidasi...' : 'Validasi PIN'}
                </Text>
                <ArrowRight size={20} color="white" style={styles.buttonIcon} />
              </TouchableOpacity>
            </>
          )}

          {/* User Data Section - Shown after PIN is validated */}
          {pinValidated && (
            <>
              {/* PIN Validation Success Card */}
              <View style={[styles.successCard, { backgroundColor: colors.success + '10', borderColor: colors.success, marginBottom: 20 }]}>
                <View style={styles.successCardHeader}>
                  <CheckCircle size={20} color={colors.success} />
                  <Text style={[styles.successCardTitle, { color: colors.success }]}>
                    PIN Valid
                  </Text>
                </View>
                <View style={styles.infoCardList}>
                  <View style={styles.infoItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.success }]} />
                    <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
                      Toko: {pinInfo.tenant_name || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.success }]} />
                    <Text style={[styles.infoItemText, { color: colors.textSecondary }]}>
                      Peran: {pinInfo.role_name || 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Data Diri Karyawan
                </Text>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Email
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.user_email ? colors.error : colors.border,
                      color: colors.text
                    }
                  ]}
                  value={employeeData.user_email}
                  onChangeText={(value) => handleInputChange('user_email', value)}
                  placeholder="contoh@email.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {errors.user_email && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.user_email}
                  </Text>
                )}
              </View>

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Nama pengguna
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.user_name ? colors.error : colors.border,
                      color: colors.text
                    }
                  ]}
                  value={employeeData.user_name}
                  onChangeText={(value) => handleInputChange('user_name', value)}
                  placeholder="Masukan nama pengguna"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoComplete="username"
                />
                {errors.user_name && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.user_name}
                  </Text>
                )}
              </View>

              {/* Nama Lengkap */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Nama Lengkap
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.user_full_name ? colors.error : colors.border,
                      color: colors.text
                    }
                  ]}
                  value={employeeData.user_full_name}
                  onChangeText={(value) => handleInputChange('user_full_name', value)}
                  placeholder="Masukan nama lengkap"
                  placeholderTextColor={colors.textSecondary}
                  autoComplete="name"
                />
                {errors.user_full_name && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.user_full_name}
                  </Text>
                )}
              </View>

              {/* Nomor Telepon */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Nomor Telepon
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      borderColor: errors.user_phone ? colors.error : colors.border,
                      color: colors.text
                    }
                  ]}
                  value={employeeData.user_phone}
                  onChangeText={(value) => handleInputChange('user_phone', value)}
                  placeholder="Contoh: 08123456789"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                />
                {errors.user_phone && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors.user_phone}
                  </Text>
                )}
              </View>

              {/* Complete Registration Button */}
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  loading && styles.buttonDisabled,
                  { backgroundColor: loading ? colors.disabled : colors.primary }
                ]}
                onPress={handleCompleteRegistration}
                disabled={loading}
              >
                <Text style={[styles.nextButtonText, { color: colors.background }]}>
                  {loading ? 'Memproses...' : 'Lanjutkan ke Verifikasi'}
                </Text>
                <ArrowRight size={20} color="white" style={styles.buttonIcon} />
              </TouchableOpacity>
            </>
          )}

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
    marginBottom: 20,
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
  successCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  successCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  successCardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
});