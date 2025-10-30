import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Info, Mail, User, LogIn } from 'lucide-react-native';

interface CompletionContentProps {
  colors: any;
  params: any;
  router: any;
}

export default function CompletionContent({
  colors,
  params,
  router
}: CompletionContentProps) {

  const handleGoToLogin = () => {
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Image
                source={require("../../../../assets/images/KasirGOTrnsprt.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: colors.text }]}>
                Pendaftaran Berhasil!
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Akun pemilik toko Anda telah berhasil dibuat
              </Text>
            </View>
          </View>

    
          {/* Tenant Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Info size={20} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.primary }]}>
                Informasi Toko
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nama Toko:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{params.tenant_name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{params.user_email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nama Lengkap:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{params.user_full_name || 'N/A'}</Text>
            </View>
          </View>

          {/* Waiting Approval Card */}
          <View style={[styles.approvalCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
            <View style={styles.approvalHeader}>
              <Clock size={24} color={colors.warning} />
              <Text style={[styles.approvalTitle, { color: colors.warning }]}>
                Menunggu Persetujuan
              </Text>
            </View>
            <Text style={[styles.approvalText, { color: colors.textSecondary }]}>
              Akun Anda perlu disetujui oleh pihak KasirGO sebelum dapat digunakan. Proses ini biasanya memakan waktu 1-2 hari kerja.
            </Text>
            <View style={styles.approvalSteps}>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                • Super Admin akan meninjau data Anda
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                • Anda akan menerima email konfirmasi
              </Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                • Setelah disetujui, Anda bisa login
              </Text>
            </View>
          </View>

  
          {/* Go to Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={handleGoToLogin}
          >
            <LogIn size={20} color={colors.background} />
            <Text style={[styles.loginButtonText, { color: colors.background }]}>
              Kembali ke Login
            </Text>
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              Butuh bantuan?{' '}
              <Text
                style={[styles.helpLink, { color: colors.primary }]}
                onPress={() => {
                  // You can customize this email address
                  const email = 'support@kasirgo.com';
                  const subject = 'Bantuan Pendaftaran Akun';
                  const body = `Halo Tim Support KasirGO,\n\nSaya membutuhkan bantuan untuk pendaftaran akun dengan detail berikut:\nNama Toko: ${params.tenant_name || 'N/A'}\nEmail: ${params.user_email || 'N/A'}\n\nTerima kasih.`;

                  // Open email client
                  if (typeof window !== 'undefined' && window.open) {
                    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }
                }}
              >
                Hubungi tim support kami
              </Text>
            </Text>
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
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
  infoCard: {
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    flex: 2,
    textAlign: 'right',
  },
  approvalCard: {
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
  },
  approvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  approvalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginLeft: 8,
  },
  approvalText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 10,
  },
  approvalSteps: {
    gap: 3,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  helpLink: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
});