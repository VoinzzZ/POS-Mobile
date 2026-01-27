import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from "react-native";
import { User, Bell, Lock, HelpCircle, LogOut, ChevronRight, Moon, Sun, ArrowLeft, Clock } from "lucide-react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import EditProfileModal from "../../src/components/cashier/modals/EditProfileModal";

export default function SettingsScreen() {
  const { user, logout, refreshProfile } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);

  React.useEffect(() => {
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
      onPress: () => setIsEditModalVisible(true),
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
      onPress: () => router.push("/(admin)/security"),
    },
    {
      icon: HelpCircle,
      title: "Bantuan & Dukungan",
      subtitle: "Dapatkan bantuan dan hubungi support",
      onPress: () => { },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Pengaturan</Text>
        <View style={styles.headerSpacer} />
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


        <View style={[styles.userCard, { backgroundColor: colors.card }]}>
          <View style={styles.userCardHeader}>
            <View style={styles.userMainInfo}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {(user?.user_full_name || user?.user_name || "U")?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userBasicInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user?.user_full_name || user?.user_name}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}20` }]}>
                  <Text style={[styles.roleText, { color: colors.primary }]}>{user?.user_role}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: colors.background }]}
              onPress={() => setIsEditModalVisible(true)}
            >
              <User size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.userDetailsSection, { borderTopColor: colors.border }]}>
            {user?.lastLogin && (
              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: colors.background }]}>
                  <Clock size={20} color={colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Login Terakhir</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {new Date(user?.lastLogin).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            )}
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
      </ScrollView >

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerSpacer: {
    width: 32,
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
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  userMainInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
  },
  userBasicInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  userDetailsSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  userPhone: {
    fontSize: 14,
    marginTop: 2,
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
