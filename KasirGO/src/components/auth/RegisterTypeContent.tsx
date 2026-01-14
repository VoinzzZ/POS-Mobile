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
import { useOrientation } from '@/src/hooks/useOrientation';

interface RegisterTypeContentProps {
  onBackToLogin: () => void;
}

export default function RegisterTypeContent({ onBackToLogin }: RegisterTypeContentProps) {
  const { colors } = useTheme();
  const { isLandscape: isLand, isTablet: isTab } = useOrientation();
  const router = useRouter();

  const handleRegisterAs = (type: 'owner' | 'employee') => {
    if (type === 'owner') {
      router.push('/auth/register/owner/' as any);
    } else if (type === 'employee') {
      router.push('/auth/register/employee/' as any);
    }
  };

  return (
    <View style={[styles.overlay, isLand ? styles.landscapeOverlay : {}]}>
      {isLand ? (
        <View style={styles.gridMainContainer}>
          {/* Owner Option - Left side */}
          <View
            style={[
              styles.optionCard,
              styles.gridOptionCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.iconContainer, styles.landscapeIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="business" size={48} color={colors.primary} />
              </View>
              <View style={styles.optionHeaderText}>
                <Text style={[styles.optionTitle, styles.landscapeOptionTitle, { color: colors.text }]}>
                  Pemilik Toko
                </Text>
                <Text style={[styles.optionSubtitle, styles.landscapeOptionSubtitle, { color: colors.textSecondary }]}>
                  Buat toko baru dan kelola bisnis Anda
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Buat dan kelola toko
              </Text>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Kelola karyawan
              </Text>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Akses penuh ke semua fitur
              </Text>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Laporan dan analitik
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, styles.landscapeRegisterButton, { backgroundColor: colors.primary }]}
              onPress={() => handleRegisterAs('owner')}
            >
              <Text style={[styles.registerButtonText, styles.landscapeRegisterButtonText, { color: colors.background }]}>
                Daftar sebagai Pemilik Toko
              </Text>
              <Ionicons name="arrow-forward" size={22} color={colors.background} />
            </TouchableOpacity>
          </View>

          {/* Employee Option - Right side */}
          <View
            style={[
              styles.optionCard,
              styles.gridOptionCard,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.iconContainer, styles.landscapeIconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="people" size={48} color={colors.secondary} />
              </View>
              <View style={styles.optionHeaderText}>
                <Text style={[styles.optionTitle, styles.landscapeOptionTitle, { color: colors.text }]}>
                  Karyawan
                </Text>
                <Text style={[styles.optionSubtitle, styles.landscapeOptionSubtitle, { color: colors.textSecondary }]}>
                  Bergabung dengan toko yang sudah ada
                </Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Gunakan kode PIN dari pemilik
              </Text>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Akses fitur sesuai role yang ditentukan owner
              </Text>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Role tersedia: Admin, Kasir, Inventory
              </Text>
              <Text style={[styles.featureItem, styles.landscapeFeatureItem, { color: colors.textSecondary }]}>
                • Menunggu persetujuan dari owner
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, styles.landscapeRegisterButton, { backgroundColor: colors.secondary }]}
              onPress={() => handleRegisterAs('employee')}
            >
              <Text style={[styles.registerButtonText, styles.landscapeRegisterButtonText, { color: colors.background }]}>
                Daftar sebagai Karyawan
              </Text>
              <Ionicons name="arrow-forward" size={22} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Portrait or phone landscape - with scroll
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isLand && isTab ? styles.landscapeScrollContent : {}]}
          showsVerticalScrollIndicator={false}
        >
          {/* Registration Type Options */}
          <View style={[styles.optionsContainer, isLand && isTab ? styles.landscapeOptionsContainer : {}]}>
            {/* Owner Option */}
            <View
              style={[
                styles.optionCard,
                { backgroundColor: colors.card, borderColor: colors.border }
              ]}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconContainer, isLand && isTab ? styles.landscapeIconContainer : {}, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="business" size={isLand && isTab ? 48 : 44} color={colors.primary} />
                </View>
                <View style={styles.optionHeaderText}>
                  <Text style={[styles.optionTitle, isLand && isTab ? styles.landscapeOptionTitle : {}, { color: colors.text }]}>
                    Pemilik Toko
                  </Text>
                  <Text style={[styles.optionSubtitle, isLand && isTab ? styles.landscapeOptionSubtitle : {}, { color: colors.textSecondary }]}>
                    Buat toko baru dan kelola bisnis Anda
                  </Text>
                </View>
              </View>

              <View style={styles.featuresList}>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Buat dan kelola toko
                </Text>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Kelola karyawan
                </Text>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Akses penuh ke semua fitur
                </Text>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Laporan dan analitik
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLand && isTab ? styles.landscapeRegisterButton : {}, { backgroundColor: colors.primary }]}
                onPress={() => handleRegisterAs('owner')}
              >
                <Text style={[styles.registerButtonText, isLand && isTab ? styles.landscapeRegisterButtonText : {}, { color: colors.background }]}>
                  Daftar sebagai Pemilik Toko
                </Text>
                <Ionicons name="arrow-forward" size={isLand && isTab ? 24 : 20} color={colors.background} />
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
                <View style={[styles.iconContainer, isLand && isTab ? styles.landscapeIconContainer : {}, { backgroundColor: colors.secondary + '20' }]}>
                  <Ionicons name="people" size={isLand && isTab ? 48 : 44} color={colors.secondary} />
                </View>
                <View style={styles.optionHeaderText}>
                  <Text style={[styles.optionTitle, isLand && isTab ? styles.landscapeOptionTitle : {}, { color: colors.text }]}>
                    Karyawan
                  </Text>
                  <Text style={[styles.optionSubtitle, isLand && isTab ? styles.landscapeOptionSubtitle : {}, { color: colors.textSecondary }]}>
                    Bergabung dengan toko yang sudah ada
                  </Text>
                </View>
              </View>

              <View style={styles.featuresList}>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Gunakan kode PIN dari pemilik
                </Text>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Akses fitur sesuai role yang ditentukan owner
                </Text>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Role tersedia: Admin, Kasir, Inventory
                </Text>
                <Text style={[styles.featureItem, isLand && isTab ? styles.landscapeFeatureItem : {}, { color: colors.textSecondary }]}>
                  • Menunggu persetujuan dari owner
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLand && isTab ? styles.landscapeRegisterButton : {}, { backgroundColor: colors.secondary }]}
                onPress={() => handleRegisterAs('employee')}
              >
                <Text style={[styles.registerButtonText, isLand && isTab ? styles.landscapeRegisterButtonText : {}, { color: colors.background }]}>
                  Daftar sebagai Karyawan
                </Text>
                <Ionicons name="arrow-forward" size={isLand && isTab ? 24 : 20} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  landscapeOverlay: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  landscapeScrollContent: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  optionsContainer: {
    gap: 20,
    width: '100%',
    justifyContent: 'center',
  },
  landscapeOptionsContainer: {
    flexDirection: 'row',
    gap: 40,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  gridMainContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 80,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  optionCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'space-between',
  },
  gridOptionCard: {
    flex: 1,
    padding: 24,
    width: 0,
    minHeight: 350,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  landscapeIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginRight: 18,
  },
  optionHeaderText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 4,
  },
  landscapeOptionTitle: {
    fontSize: 26,
  },
  optionSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  landscapeOptionSubtitle: {
    fontSize: 17,
    lineHeight: 23,
  },
  featuresList: {
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  landscapeFeatureItem: {
    fontSize: 15,
    lineHeight: 22,
  },
  registerButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  landscapeRegisterButton: {
    paddingVertical: 16,
    paddingHorizontal: 26,
    marginTop: 16,
  },
  registerButtonText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 8,
  },
  landscapeRegisterButtonText: {
    fontSize: 18,
  },
});