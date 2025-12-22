import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface OwnerEmailData {
  user_email: string;
  user_name: string;
  user_full_name: string;
  user_phone: string;
  registration_id?: string; // Keep as string for consistency with router params
}

interface DataContentProps {
  colors: any;
  emailData: OwnerEmailData;
  setEmailData: React.Dispatch<React.SetStateAction<OwnerEmailData>>;
  errors: Partial<OwnerEmailData>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<OwnerEmailData>>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  params: any;
  sendOwnerEmailVerification: any;
  router: any;
}

export default function DataContent({
  colors,
  emailData,
  setEmailData,
  errors,
  setErrors,
  loading,
  setLoading,
  params,
  sendOwnerEmailVerification,
  router
}: DataContentProps) {

  // Check if user is returning from OTP verification (email editing flow)
  const isEditingEmail = params && Object.keys(params).length > 5; // More than basic OTP params

  // Validate registration_id exists when component mounts or params change
  useEffect(() => {
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
  }, [params.registration_id, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<OwnerEmailData> = {};

    if (!emailData.user_email.trim()) {
      newErrors.user_email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.user_email)) {
      newErrors.user_email = 'Format email tidak valid';
    }

    if (!emailData.user_name.trim()) {
      newErrors.user_name = 'Username wajib diisi';
    } else if (!/^[a-zA-Z0-9_]{3,50}$/.test(emailData.user_name)) {
      newErrors.user_name = 'Username hanya boleh mengandung huruf, angka, dan underscore (3-50 karakter)';
    }

    if (!emailData.user_full_name.trim()) {
      newErrors.user_full_name = 'Nama lengkap wajib diisi';
    } else if (emailData.user_full_name.length < 3 || emailData.user_full_name.length > 100) {
      newErrors.user_full_name = 'Nama lengkap harus 3-100 karakter';
    }

    if (emailData.user_phone && !/^\+?[0-9]{10,15}$/.test(emailData.user_phone)) {
      newErrors.user_phone = 'Format nomor telepon tidak valid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof OwnerEmailData, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    // Validate registration_id exists
    if (!params.registration_id) {
      Alert.alert(
        'Error Registration',
        'ID registrasi tidak ditemukan. Silakan mulai registrasi dari awal.',
        [
          {
            text: 'Mulai dari Awal',
            onPress: () => router.replace('/auth/registerSelectType')
          }
        ]
      );
      return;
    }

    // Convert registration_id to number and validate
    const registrationId = parseInt(params.registration_id as string);
    if (isNaN(registrationId) || registrationId <= 0) {
      Alert.alert(
        'Error Registration',
        'ID registrasi tidak valid. Silakan mulai registrasi dari awal.',
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
      const requestData = {
        registration_id: registrationId,
        user_email: emailData.user_email,
        user_name: emailData.user_name,
        user_full_name: emailData.user_full_name,
        user_phone: emailData.user_phone,
      };

      const response = await sendOwnerEmailVerification(requestData);

      // Use the new registration_id returned from the API (this is the user_id)
      const newRegistrationId = response.registration_id;

      const combinedData = {
        ...params,
        ...emailData,
        registration_id: newRegistrationId.toString(),
      };

      router.push({
        pathname: '/auth/register/owner/verify',
        params: combinedData
      });
    } catch (error: any) {
      if (error.message && error.message.includes('registration_id')) {
        Alert.alert(
          'Error Registration',
          'ID registrasi tidak valid atau telah kadaluarsa. Silakan mulai registrasi dari awal.',
          [
            {
              text: 'Mulai dari Awal',
              onPress: () => router.replace('/auth/registerSelectType')
            },
            {
              text: 'Coba Lagi',
              onPress: () => {}
            }
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Gagal mengirim email verifikasi. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Simple Full Screen Scroll */}
      <ScrollView
        contentContainerStyle={styles.fullScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={styles.fullScrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="mail" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              Informasi Pemilik
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Masukkan data diri Anda sebagai pemilik toko
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

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoCardTitle, { color: colors.primary }]}>
            Email Verifikasi
          </Text>
          <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
            Kami akan mengirimkan kode OTP ke email Anda untuk verifikasi. Pastikan email yang Anda masukkan dapat diakses.
          </Text>
        </View>
        {/* Form */}
        <View style={styles.formContainer}>
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
              value={emailData.user_email}
              onChangeText={(value) => handleInputChange('user_email', value)}
              placeholder="email@example.com"
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
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Pastikan email dapat diakses untuk menerima kode verifikasi
            </Text>
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
              value={emailData.user_name}
              onChangeText={(value) => handleInputChange('user_name', value)}
              placeholder="Masukan nama pengguna"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoComplete="username"
              maxLength={50}
            />
            {errors.user_name && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.user_name}
              </Text>
            )}
            <Text style={[styles.helperText, { color: colors.textSecondary }]}>
              Hanya huruf, angka, dan underscore
            </Text>
          </View>

          {/* Full Name */}
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
              value={emailData.user_full_name}
              onChangeText={(value) => handleInputChange('user_full_name', value)}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              maxLength={100}
            />
            {errors.user_full_name && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.user_full_name}
              </Text>
            )}
          </View>

          {/* Phone */}
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
              value={emailData.user_phone}
              onChangeText={(value) => handleInputChange('user_phone', value)}
              placeholder="Contoh: 08123456789"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.user_phone && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.user_phone}
              </Text>
            )}
          </View>
        </View>

        {/* Spacer for button */}
        <View style={styles.bottomSpacer} />

        {/* Fixed Button at Bottom */}
        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              styles.fixedButton,
              loading && styles.buttonDisabled,
              { backgroundColor: loading ? colors.disabled : colors.primary }
            ]}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={[styles.nextButtonText, { color: colors.background }]}>
              {loading ? 'Mengirim...' : 'Kirim OTP'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 80,
  },
  fullScrollContainer: {
    flex: 1,
    width: '100%',
  },
  fullScrollContent: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  bottomSpacer: {
    height: 100, // Space for fixed button
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
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
  formContainer: {
    marginBottom: 32,
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
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});