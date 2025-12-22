import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from "react-native";
import { User, Bell, Lock, HelpCircle, LogOut, ChevronRight, Moon, Sun } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";

export default function OwnerSettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();

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
      onPress: () => {},
    },
    {
      icon: Bell,
      title: "Notifikasi",
      subtitle: "Atur preferensi notifikasi",
      onPress: () => {},
    },
    {
      icon: Lock,
      title: "Keamanan",
      subtitle: "Password dan pengaturan keamanan",
      onPress: () => {},
    },
    {
      icon: HelpCircle,
      title: "Bantuan & Dukungan",
      subtitle: "Dapatkan bantuan dan hubungi support",
      onPress: () => {},
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Pengaturan</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Theme Toggle */}
        <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.themeLeft}>
            {theme === "dark" ? (
              <Moon size={24} color={colors.primary} />
            ) : (
              <Sun size={24} color={colors.primary} />
            )}
            <View style={styles.themeInfo}>
              <Text style={[styles.themeTitle, { color: colors.text }]}>Mode Tema</Text>
              <Text style={[styles.themeSubtitle, { color: colors.textSecondary }]}>
                {theme === "dark" ? "Mode Gelap" : "Mode Terang"}
              </Text>
            </View>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: "#cbd5e1", true: colors.primary }}
            thumbColor={"#ffffff"}
          />
        </View>

        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user?.user_name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.user_name}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.user_email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.user_role}</Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
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

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.error }]} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Keluar</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <OwnerBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  themeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  themeInfo: {
    gap: 4,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  themeSubtitle: {
    fontSize: 12,
  },
  userCard: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: "#064e3b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
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