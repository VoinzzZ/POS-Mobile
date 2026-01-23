import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Animated, Clipboard } from "react-native";
import PagerView from "react-native-pager-view";
import { useAuth } from "../../src/context/AuthContext";
import { Store as StoreIcon, Users as UsersIcon, Receipt, Settings, Search, Key, UserPlus, UserCheck, UserX, Copy, Check, ClipboardCheck, Wallet } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import { useRouter } from "expo-router";
import { getAllUsers, User, getPinHistory, PinHistory } from "../../src/api/user";
import { useTheme } from "../../src/context/ThemeContext";
import GeneratePinModal from "../../src/components/shared/GeneratePinModal";
import PinHistoryModal from "../../src/components/shared/PinHistoryModal";
import StoreInfoForm from "../../src/components/admin/StoreInfoForm";
import ReceiptPreview from "../../src/components/admin/ReceiptPreview";
import ApproveEmployeeModal from "../../src/components/owner/ApproveEmployeeModal";
import RejectEmployeeModal from "../../src/components/owner/RejectEmployeeModal";
import UserDetailModal from "../../src/components/owner/UserDetailModal";
import ExpenseListCard from "../../src/components/owner/ExpenseListCard";
import AddExpenseModal from "../../src/components/owner/AddExpenseModal";
import { getPendingEmployeesApi } from "../../src/api/auth";

type TabType = "store" | "cashiers" | "receipt" | "expense";

export default function OwnerStore() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>("store");
  const [activeTabIndex, setActiveTabIndex] = useState(0); // For PagerView
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // For search functionality
  const [loading, setLoading] = useState(false); // Changed to false to avoid initial loading
  const [refreshing, setRefreshing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activePin, setActivePin] = useState<PinHistory | null>(null);
  const [copied, setCopied] = useState(false);
  const [storeDataForReceipt, setStoreDataForReceipt] = useState<any>(null);
  const [pendingEmployees, setPendingEmployees] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const pagerRef = useRef<PagerView>(null);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const triggerHaptic = () => {
    try {
      console.log('Tab switched');
    } catch (error) {
    }
  };

  // Tab configuration
  const tabs: { key: TabType; title: string; icon: any }[] = [
    { key: "store", title: "Toko", icon: StoreIcon },
    { key: "cashiers", title: "Karyawan", icon: UsersIcon },
    { key: "receipt", title: "Struk", icon: Receipt },
    { key: "expense", title: "Pengeluaran", icon: Wallet },
  ];

  // Check for active PIN
  const checkActivePin = async () => {
    try {
      const response = await getPinHistory(1, 1, 'active');
      if (response && response.success && response.data.pins && response.data.pins.length > 0) {
        setActivePin(response.data.pins[0]);
      } else {
        setActivePin(null);
      }
    } catch (error) {
      console.error("Error checking active PIN:", error);
      setActivePin(null);
    }
  };

  const fetchPendingEmployees = async () => {
    setLoadingPending(true);
    try {
      const response = await getPendingEmployeesApi();
      if (response.success && response.data) {
        setPendingEmployees(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Error fetching pending employees:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleTabPress = (index: number) => {
    if (index !== activeTabIndex) {
      triggerHaptic();
      setActiveTabIndex(index);
      setActiveTab(tabs[index].key);
      pagerRef.current?.setPage(index);

      // Check for active PIN when switching to cashiers tab
      if (tabs[index].key === "cashiers") {
        checkActivePin();
        fetchPendingEmployees();
      }

      // Load store data when switching to store tab
      if (tabs[index].key === "store") {
        loadStoreDataForReceipt();
      }

      // Load store data when switching to receipt tab to ensure latest data
      if (tabs[index].key === "receipt") {
        loadStoreDataForReceipt();
      }
    }
  };

  const loadStoreDataForReceipt = async () => {
    try {
      const { getStoreSettings } = await import("../../src/api/store");
      const response = await getStoreSettings();
      if (response.success && response.data) {
        setStoreDataForReceipt(response.data);
      }
    } catch (error) {
      console.error("Error loading store data for receipt preview:", error);
    }
  };

  const handlePageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    if (index !== activeTabIndex) {
      triggerHaptic();
      setActiveTabIndex(index);
      setActiveTab(tabs[index].key);

      // Check for active PIN when switching to cashiers tab
      if (tabs[index].key === "cashiers") {
        checkActivePin();
        fetchPendingEmployees();
      }

      // Load store data when switching to store tab
      if (tabs[index].key === "store") {
        loadStoreDataForReceipt();
      }

      // Load store data when switching to receipt tab to ensure latest data
      if (tabs[index].key === "receipt") {
        loadStoreDataForReceipt();
      }
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('[fetchUsers] Starting to fetch users...');
      // Fetch all users regardless of role
      const response = await getAllUsers();
      console.log('[fetchUsers] Response received:', response.success, 'Users count:', response.data?.users?.length || 0);

      if (response.success) {
        const fetchedUsers = response.data.users;
        console.log('[fetchUsers] Setting users:', fetchedUsers.length);
        console.log('[fetchUsers] Sample user data:', fetchedUsers[0]);
        setUsers(fetchedUsers);
        setAllUsers(fetchedUsers);
      } else {
        console.warn('[fetchUsers] Response not successful:', response.message);
        setUsers([]);
        setAllUsers([]);
      }
    } catch (error) {
      console.error("[fetchUsers] Error fetching users:", error);
      setUsers([]);
      setAllUsers([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await fetchUsers();

    // Check for active PIN and pending employees when loading data
    if (activeTab === "cashiers" || activeTabIndex === 1) {
      await checkActivePin();
      await fetchPendingEmployees();
    }

    // Load store data for receipt preview if on store or receipt tab
    if (activeTab === "store" || activeTabIndex === 0 || activeTab === "receipt" || activeTabIndex === 2) {
      try {
        const { getStoreSettings } = await import("../../src/api/store");
        const response = await getStoreSettings();
        if (response.success && response.data) {
          setStoreDataForReceipt(response.data);
        }
      } catch (error) {
        console.error("Error loading store data for receipt preview:", error);
      }
    }

    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();

    // Check for active PIN and pending employees when refreshing
    if (activeTab === "cashiers" || activeTabIndex === 1) {
      await checkActivePin();
      await fetchPendingEmployees();
    }

    // Load store data for receipt preview if on store or receipt tab
    if (activeTab === "store" || activeTabIndex === 0 || activeTab === "receipt" || activeTabIndex === 2) {
      try {
        const { getStoreSettings } = await import("../../src/api/store");
        const response = await getStoreSettings();
        if (response.success && response.data) {
          setStoreDataForReceipt(response.data);
        }
      } catch (error) {
        console.error("Error loading store data for receipt preview:", error);
      }
    }

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

  const handleCopyPin = () => {
    if (activePin) {
      Clipboard.setString(activePin.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kelola Toko</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Kelola informasi toko & manajemen pengguna</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(owner)/settings")}
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
            onStoreUpdate={(updatedStore) => {
              console.log('Store data updated');
              setStoreDataForReceipt(updatedStore);
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
            {/* Active PIN Display */}
            {activePin ? (
              <View style={[styles.activePinContainer, { backgroundColor: colors.card, marginHorizontal: 20, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 }]}>
                <View style={styles.activePinHeader}>
                  <Text style={[styles.activePinTitle, { color: colors.text }]}>PIN Pendaftaran Aktif</Text>
                  <View style={[styles.statusBadge, { backgroundColor: "#10b981" + "20" }]}>
                    <Text style={[styles.statusText, { color: "#10b981" }]}>Aktif</Text>
                  </View>
                </View>

                <View style={styles.pinCodeContainer}>
                  <Text style={styles.pinCode}>{activePin.code}</Text>
                  <TouchableOpacity onPress={handleCopyPin} style={styles.copyBtn}>
                    {copied ? (
                      <Check size={20} color="#10b981" />
                    ) : (
                      <Copy size={20} color="#4ECDC4" />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.expiryInfo}>
                  <Text style={[styles.expiryText, { color: colors.textSecondary }]}>Kedaluwarsa: {formatDate(activePin.expiresAt)}</Text>
                </View>
              </View>
            ) : (
              // Generate PIN Button
              <TouchableOpacity
                style={[styles.generatePinButton, { backgroundColor: "#8b5cf6", flexDirection: "row", padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }]}
                onPress={() => setShowPinModal(true)}
                activeOpacity={0.8}
              >
                <Key size={20} color="#ffffff" />
                <Text style={styles.generatePinButtonText}>Buat PIN</Text>
              </TouchableOpacity>
            )}

            {/* Pending Approvals Section */}
            {pendingEmployees.length > 0 && (
              <View style={[styles.section, { marginTop: 16 }]}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Menunggu Persetujuan ({pendingEmployees.length})</Text>
                {loadingPending ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : (
                  pendingEmployees.map((employee) => (
                    <View key={employee.user_id} style={[styles.userCard, { backgroundColor: colors.card }]}>
                      <View style={[styles.userAvatar, { backgroundColor: "#f59e0b" + "20" }]}>
                        <UserPlus size={24} color="#f59e0b" />
                      </View>
                      <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.userName, { color: colors.text }]}>{employee.user_full_name}</Text>
                            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{employee.user_email}</Text>
                          </View>
                          <View style={styles.approvalActions}>
                            <TouchableOpacity
                              style={[styles.approveBtn, { backgroundColor: colors.primary, padding: 8 }]}
                              onPress={() => {
                                setSelectedEmployee(employee);
                                setShowApproveModal(true);
                              }}
                            >
                              <UserCheck size={20} color="#ffffff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.rejectBtn, { backgroundColor: "#ef4444", padding: 8 }]}
                              onPress={() => {
                                setSelectedEmployee(employee);
                                setShowRejectModal(true);
                              }}
                            >
                              <UserX size={20} color="#ffffff" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

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
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Buat PIN untuk pendaftaran pengguna baru</Text>
                </View>
              ) : (
                users.map((userItem, index) => (
                  <Animated.View
                    key={userItem.id}
                    style={[
                      styles.userCard,
                      { backgroundColor: colors.card },
                      { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
                    ]}
                  >
                    <View style={[styles.userAvatar, { backgroundColor: colors.primary + "20" }]}>
                      <UsersIcon size={24} color={colors.primary} />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.text }]}>{userItem.userName || userItem.user_name}</Text>
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userItem.userEmail || userItem.user_email}</Text>
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
                    <TouchableOpacity
                      style={styles.moreBtn}
                      onPress={() => {
                        setSelectedUser(userItem);
                        setShowUserDetailModal(true);
                      }}
                    >
                      <Text style={[styles.moreBtnText, { color: colors.textSecondary }]}>•••</Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>

        {/* Page 3: Receipt Preview */}
        <View key="receipt" style={styles.page}>
          <ReceiptPreview store={storeDataForReceipt} />
        </View>

        {/* Page 4: Expense Management */}
        <View key="expense" style={styles.page}>
          <ExpenseListCard onAddExpense={() => setShowAddExpenseModal(true)} />
        </View>
      </PagerView>

      {/* Bottom Navigation */}
      <OwnerBottomNav />

      {/* Generate PIN Modal */}
      <GeneratePinModal
        visible={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={() => {
          // Optionally refresh user list after PIN generation
          onRefresh();
          // Check for active PIN after modal closes
          checkActivePin();
        }}
      />

      {/* PIN History Modal */}
      <PinHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Approve Employee Modal */}
      <ApproveEmployeeModal
        visible={showApproveModal}
        employee={selectedEmployee}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={async () => {
          console.log('[ApproveEmployeeModal] Employee approved, refreshing data...');
          await fetchPendingEmployees();
          await fetchUsers();
          console.log('[ApproveEmployeeModal] Data refresh completed');
        }}
      />

      {/* Reject Employee Modal */}
      <RejectEmployeeModal
        visible={showRejectModal}
        employee={selectedEmployee}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={async () => {
          console.log('[RejectEmployeeModal] Employee rejected, refreshing data...');
          await fetchPendingEmployees();
          await fetchUsers();
          console.log('[RejectEmployeeModal] Data refresh completed');
        }}
      />


      <UserDetailModal
        visible={showUserDetailModal}
        user={selectedUser}
        onClose={() => {
          setShowUserDetailModal(false);
          setSelectedUser(null);
        }}
        onUserUpdated={async () => {
          await fetchUsers();
        }}
      />

      <AddExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSuccess={() => {
          setShowAddExpenseModal(false);
        }}
      />
    </Animated.View>
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
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
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  generatePinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  generatePinButton: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
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
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    borderRadius: 20,
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
    borderRadius: 16,
    marginHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  activePinContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  activePinHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activePinTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  pinCodeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  pinCode: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8b5cf6",
    letterSpacing: 4,
    flex: 1,
  },
  copyBtn: {
    padding: 8,
  },
  expiryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  approvalActions: {
    flexDirection: "row",
    gap: 8,
  },
  approveBtn: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});