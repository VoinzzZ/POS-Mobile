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
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useAuth } from "../../src/context/AuthContext";
import { Package, TrendingUp, AlertTriangle, DollarSign, Settings } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import { getInventoryValuation, getLowStockProducts, InventoryValuation, LowStockProduct } from "../../src/api/stock";
import { formatCurrency, formatNumber, getStockStatusColor } from "../../src/utils/inventoryCalculations";

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
    { key: 'dashboard', title: 'Dashboard' },
    { key: 'movements', title: 'Pergerakan' },
    { key: 'purchases', title: 'Pembelian' },
    { key: 'opname', title: 'Opname' },
  ]);

  const [valuation, setValuation] = useState<InventoryValuation | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [valuationRes, lowStockRes] = await Promise.all([
        getInventoryValuation(),
        getLowStockProducts()
      ]);

      if (valuationRes.success && valuationRes.data) {
        setValuation(valuationRes.data);
      }

      if (lowStockRes.success && lowStockRes.data) {
        setLowStockProducts(lowStockRes.data);
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
                <DollarSign size={24} color="#10b981" />
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

  const MovementsRoute = () => (
    <View style={styles.emptyContainer}>
      <Package size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Pergerakan Stok
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Fitur ini akan segera hadir
      </Text>
    </View>
  );

  const PurchasesRoute = () => (
    <View style={styles.emptyContainer}>
      <Package size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Purchase Orders
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Fitur ini akan segera hadir
      </Text>
    </View>
  );

  const OpnameRoute = () => (
    <View style={styles.emptyContainer}>
      <Package size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        Stock Opname
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Fitur ini akan segera hadir
      </Text>
    </View>
  );

  const renderScene = SceneMap({
    dashboard: DashboardRoute,
    movements: MovementsRoute,
    purchases: PurchasesRoute,
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
});
