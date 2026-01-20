import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput } from "react-native";
import PagerView from "react-native-pager-view";
import { useAuth } from "../../src/context/AuthContext";
import { Store as StoreIcon, Users as UsersIcon, ReceiptText, Settings, Search, Key } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useRouter } from "expo-router";
import { getAllUsers, User } from "../../src/api/user";
import { useTheme } from "../../src/context/ThemeContext";
import GeneratePinModal from "../../src/components/shared/GeneratePinModal";
import StoreInfoForm from "../../src/components/admin/StoreInfoForm";
import ReceiptPreview from "../../src/components/admin/ReceiptPreview";

type TabType = "store" | "cashiers" | "receipt";

export default function StoreManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>("store");
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pagerRef = useRef<PagerView>(null);
  const triggerHaptic = () => {
    try {
      console.log('Tab switched');
    } catch (error) {
      // Silent fail
    }
  };

  const tabs: { key: TabType; title: string; icon: any }[] = [
    { key: "store", title: "Info Toko", icon: StoreIcon },
    { key: "cashiers", title: "Pengguna", icon: UsersIcon },
    { key: "receipt", title: "Preview Struk", icon: ReceiptText },
  ];


  // Helper functions for tab switching
  const handleTabPress = (index: number) => {
    if (index !== activeTabIndex) {
      triggerHaptic();
      setActiveTabIndex(index);
      setActiveTab(tabs[index].key);
      pagerRef.current?.setPage(index);
    }
  };

  const handlePageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    if (index !== activeTabIndex) {
      triggerHaptic();
      setActiveTabIndex(index);
      setActiveTab(tabs[index].key);
    }
  };


  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data.users);
        setAllUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        (user.userName || user.user_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.userEmail || user.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.role || user.user_role || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kelola Toko</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Kelola informasi toko & manajemen pengguna</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(admin)/settings")}
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTabIndex === index;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.7}
            >
              <Icon size={20} color={isActive ? colors.primary : colors.textSecondary} />
              <Text style={[styles.tabText, { color: isActive ? colors.primary : colors.textSecondary }]}>
                {tab.title}
              </Text>
              {isActive && <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Swipeable Tab Content */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {/* Page 1: Store Info */}
        <View key="store" style={styles.page}>
          <StoreInfoForm
            store={null}
            onStoreUpdate={() => {
              console.log('Store data updated');
            }}
          />
        </View>

        {/* Page 2: Cashiers */}
        <View key="cashiers" style={styles.page}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          >

            {/* Generate PIN Button */}
            <TouchableOpacity
              style={styles.generatePinButton}
              onPress={() => setShowPinModal(true)}
            >
              <Key size={20} color="#ffffff" />
              <Text style={styles.generatePinButtonText}>Generate PIN Registrasi</Text>
            </TouchableOpacity>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Cari pengguna..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Users List */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Pengguna ({users.length})</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat pengguna...</Text>
                </View>
              ) : users.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                  <UsersIcon size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>Belum ada pengguna</Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Generate PIN untuk registrasi pengguna baru</Text>
                </View>
              ) : (
                users.map((userItem) => (
                  <View key={userItem.id} style={[styles.userCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.userAvatar, { backgroundColor: colors.primary + "20" }]}>
                      <UsersIcon size={24} color={colors.primary} />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.text }]}>{userItem.userName}</Text>
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userItem.userEmail}</Text>
                      <View style={styles.badges}>
                        <View style={[styles.badge, { backgroundColor: getRoleBadgeColor(userItem.role) + "20" }]}>
                          <Text style={[styles.badgeText, { color: getRoleBadgeColor(userItem.role) }]}>
                            {userItem.role}
                          </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: getStatusColor(userItem.isVerified) + "20" }]}>
                          <Text style={[styles.badgeText, { color: getStatusColor(userItem.isVerified) }]}>
                            {userItem.isVerified ? "Terverifikasi" : "Belum Terverifikasi"}
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
        </View>

        {/* Page 3: Receipt Preview */}
        <View key="receipt" style={styles.page}>
          <ReceiptPreview />
        </View>
      </PagerView>

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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    position: "relative",
  },
  activeTab: {
    // Active tab styles handled by indicator
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -12,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
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
  searchInput: {
    flex: 1,
    fontSize: 14,
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
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
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
    fontWeight: "700",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
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
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});
