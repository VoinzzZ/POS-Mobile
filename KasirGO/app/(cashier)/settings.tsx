import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { User, Bell, Lock, HelpCircle, LogOut, ChevronRight } from "lucide-react-native";
import CashierSidebar from "../../src/components/navigation/CashierSidebar";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import ProfileCard from "../../src/components/settings/ProfileCard";
import ThemeToggleCard from "../../src/components/settings/ThemeToggleCard";
import EditProfilePanel from "../../src/components/settings/EditProfilePanel";

export default function SettingsScreen() {
  const { logout, user, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const [editProfileVisible, setEditProfileVisible] = useState(false);

  useEffect(() => {
    console.log("🔍 Settings Screen - Current user data:", user);
    refreshProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Keluar", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const settingsOptions = [
    {
      icon: User,
      title: "Profil",
      subtitle: "Kelola informasi profil Anda",
      onPress: () => setEditProfileVisible(true),
    },
    {
      icon: Bell,
      title: "Notifikasi",
      subtitle: "Atur preferensi notifikasi",
      onPress: () => { },
    },
    {
      icon: Lock,
      title: "Keamanan",
      subtitle: "Password dan pengaturan keamanan",
      onPress: () => { },
    },
    {
      icon: HelpCircle,
      title: "Bantuan & Dukungan",
      subtitle: "Dapatkan bantuan dan hubungi support",
      onPress: () => { },
    },
  ];

  const renderContent = () => (
    <>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Pengaturan</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemeToggleCard />
        <ProfileCard />

        <View style={styles.section}>
          {settingsOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.option, { backgroundColor: colors.card }]}
                onPress={option.onPress}
              >
                <View style={styles.optionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                    <Icon size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>{option.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Keluar</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.landscapeMaster}>
        <CashierSidebar />
        <View style={styles.landscapeContent}>{renderContent()}</View>
      </View>
      <EditProfilePanel visible={editProfileVisible} onClose={() => setEditProfileVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  landscapeMaster: {
    flex: 1,
    flexDirection: "row",
  },
  landscapeContent: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
