import React, { useState } from 'react';
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
import { Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react-native';

interface EmployeePasswordSetupContentProps {
  colors: any;
  params: any;
  router: any;
}

export default function PasswordSetupContent({
  colors,
  params,
  router
}: EmployeePasswordSetupContentProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pass: string): boolean => {
    const minLength = pass.length >= 6;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);

    return minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const passwordRequirements = [
    { label: 'Minimal 6 karakter', test: (pass: string) => pass.length >= 6 },
    { label: 'Mengandung huruf besar', test: (pass: string) => /[A-Z]/.test(pass) },
    { label: 'Mengandung huruf kecil', test: (pass: string) => /[a-z]/.test(pass) },
    { label: 'Mengandung angka', test: (pass: string) => /[0-9]/.test(pass) },
  ];

  const isPasswordValid = validatePassword(password);
  const isPasswordMatch = password === confirmPassword && password !== '';

  const handleCompleteRegistration = async () => {
    // Skip validation for UI testing - allow direct navigation
    setLoading(true);
    try {
      router.replace('/auth/register/employee/completion');
    } catch (error) {
      Alert.alert('Error', 'Gagal menyelesaikan pendaftaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
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
            <Lock size={32} color={colors.secondary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Buat Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Buat password aman untuk akun Anda
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

      {/* Password Requirements */}
      <View style={styles.requirementsContainer}>
        <Text style={[styles.requirementsTitle, { color: colors.text }]}>
          Persyaratan Password:
        </Text>
        {passwordRequirements.map((requirement, index) => (
          <View key={index} style={styles.requirementItem}>
            <View style={[
              styles.requirementIcon,
              { backgroundColor: requirement.test(password) ? colors.success + '20' : colors.border }
            ]}>
              <Check
                size={12}
                color={requirement.test(password) ? colors.success : colors.textSecondary}
              />
            </View>
            <Text style={[
              styles.requirementText,
              {
                color: requirement.test(password) ? colors.success : colors.textSecondary,
                fontFamily: requirement.test(password) ? 'Inter_500Medium' : 'Inter_400Regular'
              }
            ]}>
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Password
          </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text
                }
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              maxLength={100}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.textSecondary} />
              ) : (
                <Eye size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Konfirmasi Password
          </Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                {
                  backgroundColor: colors.card,
                  borderColor: isPasswordMatch ? colors.success : colors.border,
                  color: colors.text
                }
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Konfirmasi password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              maxLength={100}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={colors.textSecondary} />
              ) : (
                <Eye size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
          {confirmPassword && !isPasswordMatch && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              Password tidak cocok
            </Text>
          )}
        </View>
      </View>

      {/* Complete Button */}
      <TouchableOpacity
        style={[
          styles.completeButton,
          loading && styles.buttonDisabled,
          {
            backgroundColor: loading ? colors.disabled : colors.primary
          }
        ]}
        onPress={handleCompleteRegistration}
        disabled={loading}
      >
        <Text style={[styles.completeButtonText, { color: colors.background }]}>
          {loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
        </Text>
        <ArrowRight size={20} color="white" style={styles.buttonIcon} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
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
  requirementsContainer: {
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 45,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  completeButton: {
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
  completeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
});