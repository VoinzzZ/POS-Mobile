import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface TenantData {
  tenant_name: string;
  tenant_phone: string;
  tenant_email: string;
  tenant_address: string;
  tenant_description: string;
}

interface OwnerRegistrationContentProps {
  onBackToRegisterType: () => void;
}

export default function OwnerRegistrationContent({ onBackToRegisterType }: OwnerRegistrationContentProps) {
  const [tenantData, setTenantData] = useState<TenantData>({
    tenant_name: '',
    tenant_phone: '',
    tenant_email: '',
    tenant_address: '',
    tenant_description: '',
  });
  const [errors, setErrors] = useState<Partial<TenantData>>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { colors } = useTheme();
  const { registerOwnerTenant } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Partial<TenantData> = {};

    if (!tenantData.tenant_name.trim()) {
      newErrors.tenant_name = 'Nama toko wajib diisi';
    } else if (tenantData.tenant_name.length < 3) {
      newErrors.tenant_name = 'Nama toko minimal 3 karakter';
    } else if (tenantData.tenant_name.length > 100) {
      newErrors.tenant_name = 'Nama toko maksimal 100 karakter';
    }

    if (tenantData.tenant_phone && !/^[0-9]{10,15}$/.test(tenantData.tenant_phone)) {
      newErrors.tenant_phone = 'Format nomor telepon tidak valid';
    }

    if (tenantData.tenant_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantData.tenant_email)) {
      newErrors.tenant_email = 'Format email tidak valid';
    }

    if (tenantData.tenant_description && tenantData.tenant_description.length > 500) {
      newErrors.tenant_description = 'Deskripsi maksimal 500 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TenantData, value: string) => {
    setTenantData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = async () => {
    // Skip validation for UI testing
    setLoading(true);
    try {
      // Mock response for UI testing
      const mockResponse = {
        registration_id: Date.now(), // Use timestamp as mock ID
        tenant_id: Date.now() + 1, // Use timestamp + 1 as mock tenant ID
      };

      router.push({
        pathname: '/auth/register/owner/data',
        params: {
          ...tenantData,
          registration_id: mockResponse.registration_id,
          tenant_id: mockResponse.tenant_id,
        }
      } as any);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Gagal membuat pendaftaran toko. Silakan coba lagi.');
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
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="business" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>
                Buat Toko Baru
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Masukkan informasi dasar toko Anda
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

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Tenant Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Nama Toko
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.tenant_name ? colors.error : colors.border,
                    color: colors.text
                  }
                ]}
                value={tenantData.tenant_name}
                onChangeText={(value) => handleInputChange('tenant_name', value)}
                placeholder="Masukkan nama toko"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
                maxLength={100}
              />
              {errors.tenant_name && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.tenant_name}
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
                    borderColor: errors.tenant_phone ? colors.error : colors.border,
                    color: colors.text
                  }
                ]}
                value={tenantData.tenant_phone}
                onChangeText={(value) => handleInputChange('tenant_phone', value)}
                placeholder="Contoh: 08123456789"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                maxLength={15}
              />
              {errors.tenant_phone && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.tenant_phone}
                </Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Email Toko
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.tenant_email ? colors.error : colors.border,
                    color: colors.text
                  }
                ]}
                value={tenantData.tenant_email}
                onChangeText={(value) => handleInputChange('tenant_email', value)}
                placeholder="toko@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
              {errors.tenant_email && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.tenant_email}
                </Text>
              )}
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Alamat
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={tenantData.tenant_address}
                onChangeText={(value) => handleInputChange('tenant_address', value)}
                placeholder="Masukkan alamat lengkap toko"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Deskripsi Toko
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.tenant_description ? colors.error : colors.border,
                    color: colors.text
                  }
                ]}
                value={tenantData.tenant_description}
                onChangeText={(value) => handleInputChange('tenant_description', value)}
                placeholder="Ceritakan tentang toko Anda (opsional)"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              {errors.tenant_description && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.tenant_description}
                </Text>
              )}
            </View>
          </View>

          {/* Action Button */}
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
            <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
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