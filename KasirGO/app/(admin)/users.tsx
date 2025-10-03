import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { Users as UsersIcon, Settings, Search, Key } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useRouter } from "expo-router";
import { getAllUsers, getUserStats, User } from "../../src/api/admin";
import { useTheme } from "../../src/context/ThemeContext";
import GeneratePinModal from "../../src/components/shared/GeneratePinModal";

export default function Users() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    cashierCount: 0,
    verifiedUsers: 0,
  });


  const fetchUsers = async () => {
    try {
      const response = await getAllUsers('CASHIER');
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    return role === "ADMIN" ? "#ec4899" : "#3b82f6";
  };

  const getStatusColor = (verified: boolean) => {
    return verified ? "#10b981" : "#f59e0b";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manajemen Kasir</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Kelola akun kasir</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/(admin)/settings")} 
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ECDC4" />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.cashierCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Kasir</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{users.filter(u => u.isVerified).length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Terverifikasi</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{users.filter(u => !u.isVerified).length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Belum Verifikasi</Text>
          </View>
        </View>

        {/* Generate PIN Button */}
        <TouchableOpacity 
          style={styles.generatePinButton}
          onPress={() => setShowPinModal(true)}
        >
          <Key size={20} color="#ffffff" />
          <Text style={styles.generatePinButtonText}>Generate Registration PIN</Text>
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Search size={20} color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>Cari pengguna...</Text>
        </View>

        {/* Users List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Kasir ({users.length})</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat pengguna...</Text>
            </View>
          ) : users.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
              <UsersIcon size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>Belum ada kasir</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Generate PIN untuk registrasi kasir baru</Text>
            </View>
          ) : (
            users.map((userItem) => (
              <View key={userItem.id} style={[styles.userCard, { backgroundColor: colors.card }]}>
                <View style={[styles.userAvatar, { backgroundColor: colors.primary + "20" }]}>
                  <UsersIcon size={24} color={colors.primary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.text }]}>{userItem.userName}</Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userItem.email}</Text>
                  <View style={styles.badges}>
                    <View style={[styles.badge, { backgroundColor: getRoleBadgeColor(userItem.role) + "20" }]}>
                      <Text style={[styles.badgeText, { color: getRoleBadgeColor(userItem.role) }]}>
                        {userItem.role}
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(userItem.isVerified) + "20" }]}>
                      <Text style={[styles.badgeText, { color: getStatusColor(userItem.isVerified) }]}>
                        {userItem.isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                  <Text style={[styles.moreBtnText, { color: colors.textSecondary }]}>•••</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <AdminBottomNav />
      
      {/* Generate PIN Modal */}
      <GeneratePinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          // Optionally refresh user list after PIN generation
          onRefresh();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  settingsBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4ECDC4",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
  },
  generatePinButton: {
    flexDirection: "row",
    backgroundColor: "#8b5cf6",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  generatePinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 12,
  },
  userCard: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4ECDC4" + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
  },
  badges: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  moreBtn: {
    padding: 8,
  },
  moreBtnText: {
    fontSize: 20,
    color: "#64748b",
    fontWeight: "700",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e293b",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});
