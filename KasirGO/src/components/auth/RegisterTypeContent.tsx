import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface RegisterTypeContentProps {
  onBackToLogin: () => void;
}

export default function RegisterTypeContent({ onBackToLogin }: RegisterTypeContentProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handleRegisterAs = (type: 'owner' | 'employee') => {
    if (type === 'owner') {
      router.push('/auth/register/owner/' as any);
    } else if (type === 'employee') {
      router.push('/auth/register/employee/' as any);
    }
  };

  return (
    <View style={styles.overlay}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Registration Type Options */}
        <View style={styles.optionsContainer}>
          {/* Owner Option */}
          <View
            style={[
              styles.optionCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="business" size={36} color={colors.primary} />
              </View>
              <View style={styles.optionHeaderText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Pemilik Toko
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                  Buat toko baru dan kelola bisnis Anda
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Buat dan kelola toko
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Kelola karyawan
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Akses penuh ke semua fitur
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Laporan dan analitik
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.primary }]}
              onPress={() => handleRegisterAs('owner')}
            >
              <Text style={[styles.registerButtonText, { color: colors.background }]}>
                Daftar sebagai Pemilik Toko
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.background} />
            </TouchableOpacity>
          </View>

          {/* Employee Option */}
          <View
            style={[
              styles.optionCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="people" size={36} color={colors.secondary} />
              </View>
              <View style={styles.optionHeaderText}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Karyawan
                </Text>
                <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                  Bergabung dengan toko yang sudah ada
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Gunakan kode PIN dari pemilik
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Akses fitur sesuai role yang ditentukan owner
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Role tersedia: Admin, Kasir, Inventory
              </Text>
              <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
                • Menunggu persetujuan dari owner
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: colors.secondary }]}
              onPress={() => handleRegisterAs('employee')}
            >
              <Text style={[styles.registerButtonText, { color: colors.background }]}>
                Daftar sebagai Karyawan
              </Text>
              <Ionicons name="arrow-forward" size={18} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  optionsContainer: {
    gap: 24,
    marginVertical: 20,
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    maxHeight: '85%',
  },
  optionCard: {
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'flex-start',
    minHeight: 280,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  optionHeaderText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 22,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  featuresList: {
    gap: 8,
    marginTop: 8,
  },
  featureItem: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  registerButton: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 10,
  },
});