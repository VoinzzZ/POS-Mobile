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
import { User, ArrowRight } from 'lucide-react-native';
import { registerEmployeeWithPinApi } from '@/src/api/auth';

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
    // Clear error when user starts typing
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
      // Make API call to register employee with PIN and user data
      // This is where PIN validation actually happens - if PIN is invalid, API will return error
      const response = await registerEmployeeWithPinApi({
        pin_registration: params.pin_registration,
        user_email: employeeData.user_email,
        user_name: employeeData.user_name,
        user_full_name: employeeData.user_full_name,
        user_phone: employeeData.user_phone,
      });

      if (response.success) {
        // Prepare data for next step - include registration ID from API response
        const combinedData = {
          pin_registration: params.pin_registration,
          ...employeeData,
          registration_id: response.data?.user_id, // Use the user_id from response as registration_id
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

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
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

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
            <View style={[styles.progressLine, { backgroundColor: colors.border }]} />
            <View style={[styles.progressDot, { backgroundColor: colors.border }]} />
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
              placeholder="Masukan nama pemngguna"
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
              {loading ? 'Memproses...' : 'Lanjutkan'}
            </Text>
            <ArrowRight size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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