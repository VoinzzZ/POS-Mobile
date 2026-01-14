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
import { User, ArrowRight, Info } from 'lucide-react-native';
import { registerEmployeeWithPinApi } from '@/src/api/auth';
import { useOrientation } from '@/src/hooks/useOrientation';

interface EmployeeData {
  user_email: string;
  user_name: string;
  user_full_name: string;
  user_phone: string;
}

interface EmployeeDataContentProps {
  colors: any;
  params: any;
  router: any;
}

export default function EmployeeDataContent({ colors, params, router }: EmployeeDataContentProps) {
  const { isLandscape: isLand } = useOrientation();
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    user_email: '',
    user_name: '',
    user_full_name: '',
    user_phone: '',
  });
  const [errors, setErrors] = useState<Partial<EmployeeData>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
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
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof EmployeeData, value: string) => {
    setEmployeeData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await registerEmployeeWithPinApi({
        pin_registration: params.pin_registration,
        user_email: employeeData.user_email,
        user_name: employeeData.user_name,
        user_full_name: employeeData.user_full_name,
        user_phone: employeeData.user_phone,
      });

      if (response.success) {
        const combinedData = {
          pin_registration: params.pin_registration,
          ...employeeData,
          registration_id: response.data?.registration_id,
        };

        router.push({
          pathname: '/auth/register/employee/verify',
          params: combinedData
        } as any);
      } else {
        Alert.alert('Error', response.message || 'PIN tidak valid atau gagal mendaftar. Silakan coba lagi.');
      }
    } catch (error: any) {
      console.error('Error registering employee with PIN and user data:', error);
      Alert.alert('Error', error.response?.data?.message || error.message || 'PIN tidak valid atau gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text, fontSize: isLand ? 17 : 16 }]}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: errors.user_email ? colors.error : colors.border,
              color: colors.text,
              fontSize: isLand ? 17 : 16,
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
          <Text style={[styles.errorText, { color: colors.error, fontSize: isLand ? 15 : 14 }]}>
            {errors.user_email}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text, fontSize: isLand ? 17 : 16 }]}>
          Nama pengguna
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: errors.user_name ? colors.error : colors.border,
              color: colors.text,
              fontSize: isLand ? 17 : 16,
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
          <Text style={[styles.errorText, { color: colors.error, fontSize: isLand ? 15 : 14 }]}>
            {errors.user_name}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text, fontSize: isLand ? 17 : 16 }]}>
          Nama Lengkap
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: errors.user_full_name ? colors.error : colors.border,
              color: colors.text,
              fontSize: isLand ? 17 : 16,
            }
          ]}
          value={employeeData.user_full_name}
          onChangeText={(value) => handleInputChange('user_full_name', value)}
          placeholder="Masukan nama lengkap"
          placeholderTextColor={colors.textSecondary}
          autoComplete="name"
        />
        {errors.user_full_name && (
          <Text style={[styles.errorText, { color: colors.error, fontSize: isLand ? 15 : 14 }]}>
            {errors.user_full_name}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text, fontSize: isLand ? 17 : 16 }]}>
          Nomor Telepon
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: errors.user_phone ? colors.error : colors.border,
              color: colors.text,
              fontSize: isLand ? 17 : 16,
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
          <Text style={[styles.errorText, { color: colors.error, fontSize: isLand ? 15 : 14 }]}>
            {errors.user_phone}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.nextButton,
          loading && styles.buttonDisabled,
          { backgroundColor: loading ? colors.disabled : colors.primary, paddingVertical: isLand ? 16 : 16 }
        ]}
        onPress={handleNext}
        disabled={loading}
      >
        <Text style={[styles.nextButtonText, { color: colors.background, fontSize: isLand ? 17 : 16 }]}>
          {loading ? 'Memproses...' : 'Lanjutkan'}
        </Text>
        <ArrowRight size={isLand ? 22 : 20} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      {isLand ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.landscapeRow}>
            <View style={styles.leftColumn}>
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                    <User size={28} color={colors.secondary} />
                  </View>
                  <Text style={[styles.title, { color: colors.text, fontSize: 26 }]}>
                    Data Diri Karyawan
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: 16 }]}>
                    Lengkapi data diri Anda
                  </Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={[styles.progressDot, { backgroundColor: colors.primary, width: 10, height: 10 }]} />
                <View style={[styles.progressLine, { backgroundColor: colors.primary, width: 28 }]} />
                <View style={[styles.progressDot, { backgroundColor: colors.primary, width: 10, height: 10 }]} />
                <View style={[styles.progressLine, { backgroundColor: colors.border, width: 28 }]} />
                <View style={[styles.progressDot, { backgroundColor: colors.border, width: 10, height: 10 }]} />
                <View style={[styles.progressLine, { backgroundColor: colors.border, width: 28 }]} />
                <View style={[styles.progressDot, { backgroundColor: colors.border, width: 10, height: 10 }]} />
              </View>

              <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
                <View style={styles.infoCardHeader}>
                  <Info size={22} color={colors.primary} />
                  <Text style={[styles.infoCardTitle, { color: colors.primary, fontSize: 18 }]}>
                    Informasi Data Diri
                  </Text>
                </View>
                <View style={styles.infoCardList}>
                  <View style={styles.infoItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.primary, width: 7, height: 7 }]} />
                    <Text style={[styles.infoItemText, { color: colors.textSecondary, fontSize: 15 }]}>
                      Pastikan data yang diisi sesuai identitas
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.primary, width: 7, height: 7 }]} />
                    <Text style={[styles.infoItemText, { color: colors.textSecondary, fontSize: 15 }]}>
                      Email akan digunakan untuk verifikasi akun
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={[styles.bulletPoint, { backgroundColor: colors.primary, width: 7, height: 7 }]} />
                    <Text style={[styles.infoItemText, { color: colors.textSecondary, fontSize: 15 }]}>
                      Nomor telepon bersifat opsional
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.rightColumn}>
              {renderForm()}
            </View>
          </View>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                  <User size={24} color={colors.secondary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Data Diri Karyawan
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Lengkapi data diri Anda
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
              <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
              <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
              <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
              <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
              <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
              <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
            </View>

            {renderForm()}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  landscapeRow: {
    flexDirection: 'row',
    gap: 50,
    paddingHorizontal: 60,
    paddingTop: 200,
    paddingBottom: 40,
    flex: 1,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
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