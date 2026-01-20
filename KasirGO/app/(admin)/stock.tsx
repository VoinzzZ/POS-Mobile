import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useAuth } from "../../src/context/AuthContext";
import { Package, TrendingUp, AlertTriangle, DollarSign, Settings, Search, Filter, X, ShoppingCart, Plus, BanknoteArrowDown, Wallet } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import { getInventoryValuation, getLowStockProducts, getStockMovements, InventoryValuation, LowStockProduct } from "../../src/api/stock";
import { formatCurrency, formatNumber, getStockStatusColor } from "../../src/utils/inventoryCalculations";
import StockMovementCard from "../../src/components/admin/StockMovementCard";
import MovementFilters from "../../src/components/admin/MovementFilters";
import { getPurchaseSummary, PurchaseSummary } from "../../src/api/manualPurchase";
import OpnameCard from "../../src/components/admin/OpnameCard";
import StartOpnameModal from "../../src/components/admin/StartOpnameModal";
import { getStockOpnames, processStockOpname, StockOpname } from "../../src/api/opname";

export default function StockScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const layout = useWindowDimensions();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, user]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'dashboard', title: 'Valuasi' },
    { key: 'movements', title: 'Pergerakan' },
    { key: 'opname', title: 'Opname' },
  ]);

  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseSummary | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const [valuationRes, lowStockRes, purchaseRes] = await Promise.all([
        getInventoryValuation(),
        getLowStockProducts(),
        getPurchaseSummary(
          startOfMonth.toISOString(),
          endOfMonth.toISOString()
        )
      ]);

      if (valuationRes.success && valuationRes.data) {
        setValuation(valuationRes.data);
      }

      if (lowStockRes.success && lowStockRes.data) {
        setLowStockProducts(lowStockRes.data);
      }

      if (purchaseRes.success && purchaseRes.data) {
        setPurchaseSummary(purchaseRes.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  const DashboardRoute = () => (
    <ScrollView
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Memuat data...
          </Text>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: colors.primary + "20" }]}>
                <Package size={24} color={colors.primary} />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatNumber(valuation?.summary.total_products || 0)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Total Produk
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: "#10b981" + "20" }]}>
                <Wallet size={24} color="#10b981" />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatCurrency(valuation?.summary.total_selling_value || 0)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Nilai Jual
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: "#3b82f6" + "20" }]}>
                <TrendingUp size={24} color="#3b82f6" />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {valuation?.summary.average_profit_margin.toFixed(1) || 0}%
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Margin Rata-rata
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: "#f59e0b" + "20" }]}>
                <AlertTriangle size={24} color="#f59e0b" />
              </View>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {formatNumber(valuation?.summary.low_stock_count || 0)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                Stok Rendah
              </Text>
            </View>
          </View>

          <View style={[styles.purchaseCard, { backgroundColor: colors.card }]}>
            <View style={styles.purchaseHeader}>
              <View style={[styles.purchaseIcon, { backgroundColor: "#ef4444" + "20" }]}>
                <BanknoteArrowDown size={20} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.purchaseTitle, { color: colors.text }]}>
                  Pengeluaran Pembelian Bulan Ini
                </Text>
                <Text style={[styles.purchaseSubtitle, { color: colors.textSecondary }]}>
                  {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <View style={styles.purchaseContent}>
              <Text style={[styles.purchaseAmount, { color: "#ef4444" }]}>
                {formatCurrency(purchaseSummary?.total_purchase || 0)}
              </Text>
              <Text style={[styles.purchaseCount, { color: colors.textSecondary }]}>
                {purchaseSummary?.transaction_count || 0} transaksi
              </Text>
            </View>
          </View>

          <View style={[styles.valuationCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Valuasi Inventory
            </Text>
            <View style={styles.valuationRow}>
              <Text style={[styles.valuationLabel, { color: colors.textSecondary }]}>
                Total Nilai Modal
              </Text>
              <Text style={[styles.valuationValue, { color: colors.text }]}>
                {formatCurrency(valuation?.summary.total_cost_value || 0)}
              </Text>
            </View>
            <View style={styles.valuationRow}>
              <Text style={[styles.valuationLabel, { color: colors.textSecondary }]}>
                Total Nilai Jual
              </Text>
              <Text style={[styles.valuationValue, { color: colors.text }]}>
                {formatCurrency(valuation?.summary.total_selling_value || 0)}
              </Text>
            </View>
            <View style={[styles.valuationRow, styles.valuationTotal]}>
              <Text style={[styles.valuationLabel, { color: colors.text, fontWeight: "700" }]}>
                Potensi Profit
              </Text>
              <Text style={[styles.valuationValue, { color: "#10b981", fontWeight: "700" }]}>
                {formatCurrency(valuation?.summary.total_potential_profit || 0)}
              </Text>
            </View>
          </View>

          {lowStockProducts.length > 0 && (
            <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
              <View style={styles.alertHeader}>
                <AlertTriangle size={20} color="#f59e0b" />
                <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
                  Peringatan Stok Rendah
                </Text>
              </View>
              {lowStockProducts.slice(0, 5).map((product) => (
                <View key={product.product_id} style={styles.alertItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.alertProductName, { color: colors.text }]}>
                      {product.product_name}
                    </Text>
                    <Text style={[styles.alertProductSku, { color: colors.textSecondary }]}>
                      {product.product_sku || 'No SKU'}
                    </Text>
                  </View>
                  <View style={styles.alertQty}>
                    <Text style={[styles.alertQtyText, { color: "#ef4444" }]}>
                      {product.product_qty} / {product.product_min_stock}
                    </Text>
                    <Text style={[styles.alertQtyLabel, { color: colors.textSecondary }]}>
                      Kurang {product.shortage}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedMovementType, setSelectedMovementType] = useState<string | null>(null);
  const [selectedReferenceType, setSelectedReferenceType] = useState<string | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementsRefreshing, setMovementsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [opnames, setOpnames] = useState<StockOpname[]>([]);
  const [opnamesLoading, setOpnamesLoading] = useState(false);
  const [opnamesRefreshing, setOpnamesRefreshing] = useState(false);
  const [opnamesPage, setOpnamesPage] = useState(1);
  const [opnamesTotalPages, setOpnamesTotalPages] = useState(1);
  const [opnameFilter, setOpnameFilter] = useState<'all' | 'pending' | 'processed'>('all');
  const [opnameModalVisible, setOpnameModalVisible] = useState(false);

  const loadMovements = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setMovementsRefreshing(true);
      } else {
        setMovementsLoading(true);
      }

      const filters: any = {
        page,
        limit: 20,
      };

      if (selectedMovementType) filters.movement_type = selectedMovementType;
      if (selectedReferenceType) filters.reference_type = selectedReferenceType;

      const response = await getStockMovements(filters);

      if (response.success && response.data) {
        setMovements(response.data);
        if (response.pagination) {
          setCurrentPage(response.pagination.currentPage);
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Error loading movements:", error);
    } finally {
      setMovementsLoading(false);
      setMovementsRefreshing(false);
    }
  };

  useEffect(() => {
    loadMovements(1);
  }, [selectedMovementType, selectedReferenceType]);

  const onMovementsRefresh = useCallback(async () => {
    await loadMovements(currentPage, true);
  }, [currentPage, selectedMovementType, selectedReferenceType]);

  const handleResetFilters = () => {
    setSelectedMovementType(null);
    setSelectedReferenceType(null);
  };

  const filteredMovements = movements.filter((movement) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      movement.m_product?.product_name.toLowerCase().includes(query) ||
      movement.m_product?.product_sku?.toLowerCase().includes(query) ||
      movement.notes?.toLowerCase().includes(query)
    );
  });

  const hasActiveFilters = selectedMovementType !== null || selectedReferenceType !== null;

  const loadOpnames = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setOpnamesRefreshing(true);
      } else {
        setOpnamesLoading(true);
      }

      const filters: any = {
        page,
        limit: 20,
      };

      if (opnameFilter === 'pending') {
        filters.processed = false;
      } else if (opnameFilter === 'processed') {
        filters.processed = true;
      }

      const res = await getStockOpnames(filters);

      if (res.success && res.data) {
        setOpnames(res.data);
        if (res.pagination) {
          setOpnamesPage(res.pagination.currentPage);
          setOpnamesTotalPages(res.pagination.totalPages);
        }
      }
    } catch (error) {
      console.error("Error loading opnames:", error);
    } finally {
      setOpnamesLoading(false);
      setOpnamesRefreshing(false);
    }
  };

  const handleProcessOpname = async (opnameId: number) => {
    try {
      const res = await processStockOpname(opnameId);
      if (res.success) {
        loadOpnames(opnamesPage);
        loadDashboardData();
      } else {
        Alert.alert("Error", res.message || "Gagal memproses opname");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Terjadi kesalahan");
    }
  };

  const handleOpnameSuccess = () => {
    loadOpnames(1);
    loadDashboardData();
  };

  useEffect(() => {
    if (index === 2) {
      loadOpnames(1);
    }
  }, [index, opnameFilter]);

  const MovementsRoute = () => (
    <View style={styles.movementsContainer}>
      <View style={styles.movementsHeader}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari produk..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: hasActiveFilters ? colors.primary : colors.card,
            }
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color={hasActiveFilters ? "#fff" : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {hasActiveFilters && (
        <View style={styles.activeFilters}>
          {selectedMovementType && (
            <View style={[styles.filterChip, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                {selectedMovementType === "IN" && "Masuk"}
                {selectedMovementType === "OUT" && "Keluar"}
                {selectedMovementType === "ADJUSTMENT" && "Penyesuaian"}
                {selectedMovementType === "RETURN" && "Retur"}
              </Text>
              <TouchableOpacity onPress={() => setSelectedMovementType(null)}>
                <X size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          {selectedReferenceType && (
            <View style={[styles.filterChip, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>
                {selectedReferenceType === "PURCHASE" && "Pembelian"}
                {selectedReferenceType === "SALE" && "Penjualan"}
                {selectedReferenceType === "ADJUSTMENT" && "Penyesuaian"}
                {selectedReferenceType === "RETURN" && "Retur"}
                {selectedReferenceType === "OPNAME" && "Opname"}
              </Text>
              <TouchableOpacity onPress={() => setSelectedReferenceType(null)}>
                <X size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {movementsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Memuat pergerakan...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMovements}
          renderItem={({ item }) => <StockMovementCard movement={item} />}
          keyExtractor={(item) => item.movement_id.toString()}
          contentContainerStyle={styles.movementsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={movementsRefreshing}
              onRefresh={onMovementsRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Package size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                {searchQuery ? "Tidak ada hasil" : "Belum ada pergerakan"}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                {searchQuery
                  ? "Coba kata kunci lain"
                  : "Pergerakan stok akan muncul di sini"}
              </Text>
            </View>
          )}
        />
      )}

      <MovementFilters
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        selectedType={selectedMovementType}
        selectedReference={selectedReferenceType}
        onTypeChange={setSelectedMovementType}
        onReferenceChange={setSelectedReferenceType}
        onReset={handleResetFilters}
      />
    </View>
  );

  const OpnameRoute = () => (
    <View style={styles.movementsContainer}>
      <View style={styles.movementsHeader}>
        <View style={styles.opnameFilters}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              opnameFilter === 'all' && styles.filterTabActive,
              opnameFilter === 'all' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setOpnameFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                opnameFilter === 'all' && styles.filterTabTextActive,
                opnameFilter === 'all' && { color: '#fff' },
                { color: colors.text },
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              opnameFilter === 'pending' && styles.filterTabActive,
              opnameFilter === 'pending' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setOpnameFilter('pending')}
          >
            <Text
              style={[
                styles.filterTabText,
                opnameFilter === 'pending' && styles.filterTabTextActive,
                opnameFilter === 'pending' && { color: '#fff' },
                { color: colors.text },
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              opnameFilter === 'processed' && styles.filterTabActive,
              opnameFilter === 'processed' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setOpnameFilter('processed')}
          >
            <Text
              style={[
                styles.filterTabText,
                opnameFilter === 'processed' && styles.filterTabTextActive,
                opnameFilter === 'processed' && { color: '#fff' },
                { color: colors.text },
              ]}
            >
              Diproses
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setOpnameModalVisible(true)}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {opnamesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Memuat data...
          </Text>
        </View>
      ) : (
        <FlatList
          data={opnames}
          keyExtractor={(item) => item.opname_id.toString()}
          renderItem={({ item }) => (
            <OpnameCard
              opname={item}
              onProcess={handleProcessOpname}
            />
          )}
          contentContainerStyle={styles.movementsList}
          refreshControl={
            <RefreshControl
              refreshing={opnamesRefreshing}
              onRefresh={() => loadOpnames(opnamesPage, true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                Belum ada opname
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Buat opname baru untuk mulai
              </Text>
            </View>
          }
        />
      )}

      <StartOpnameModal
        visible={opnameModalVisible}
        onClose={() => setOpnameModalVisible(false)}
        onSuccess={handleOpnameSuccess}
      />
    </View>
  );

  const renderScene = SceneMap({
    dashboard: DashboardRoute,
    movements: MovementsRoute,
    opname: OpnameRoute,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors.primary }}
      style={{ backgroundColor: colors.background }}
      labelStyle={{ fontSize: 13, fontWeight: '600', textTransform: 'none' }}
      activeColor={colors.primary}
      inactiveColor={colors.textSecondary}
      scrollEnabled
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Manajemen Inventory
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Kelola stok dan pembelian
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(admin)/settings")}
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

      <AdminBottomNav />
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  valuationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  valuationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  valuationTotal: {
    borderTopWidth: 1,
    borderTopColor: "#334155",
    marginTop: 8,
    paddingTop: 12,
  },
  valuationLabel: {
    fontSize: 14,
  },
  valuationValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  alertCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  alertProductName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  alertProductSku: {
    fontSize: 12,
  },
  alertQty: {
    alignItems: "flex-end",
  },
  alertQtyText: {
    fontSize: 14,
    fontWeight: "700",
  },
  alertQtyLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  movementsContainer: {
    flex: 1,
  },
  movementsHeader: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 44,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilters: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  movementsList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  purchaseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  purchaseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  purchaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  purchaseTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  purchaseSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  purchaseContent: {
    alignItems: "center",
    paddingVertical: 8,
  },
  purchaseAmount: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  purchaseCount: {
    fontSize: 13,
  },
  opnameFilters: {
    flexDirection: "row",
    flex: 1,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  filterTabActive: {
    borderColor: "transparent",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#fff",
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

