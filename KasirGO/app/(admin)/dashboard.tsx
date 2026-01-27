import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { DollarSign, Package, Users, TrendingUp, Settings } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import RevenueChart from "../../src/components/shared/RevenueChart";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { getFinancialSummary } from "../../src/api/financial";
import { getAllProducts } from "../../src/api/product";
import { getStockMovementStatistics } from "../../src/api/stock";
import NotificationIcon from "../../src/components/admin/NotificationIcon";


export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [statsData, setStatsData] = useState({
    totalRevenue: "Rp 0",
    totalProducts: "0",
    totalTransactions: "0",
    growth: "0%",
  });
  const [stockMovementStats, setStockMovementStats] = useState({
    incomingTotal: "0",
    returnTotal: "0",
    outgoingTransactionTotal: "0",
    outgoingNonTransactionTotal: "0",
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date().toLocaleDateString('id-ID', options);
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get current month dates
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = now;

      // Get last month dates
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch data in parallel
      const [currentMonthData, lastMonthData, productsData, stockMovementData] = await Promise.all([
        getFinancialSummary({
          start_date: currentMonthStart.toISOString().split('T')[0],
          end_date: currentMonthEnd.toISOString().split('T')[0],
        }),
        getFinancialSummary({
          start_date: lastMonthStart.toISOString().split('T')[0],
          end_date: lastMonthEnd.toISOString().split('T')[0],
        }),
        getAllProducts(),
        getStockMovementStatistics({
          start_date: currentMonthStart.toISOString().split('T')[0],
          end_date: currentMonthEnd.toISOString().split('T')[0],
        }),
      ]);

      // Extract data
      const currentRevenue = currentMonthData.data?.revenue?.total || 0;
      const lastRevenue = lastMonthData.data?.revenue?.total || 0;
      const totalProducts = productsData.data?.length || 0;
      const totalTransactions = currentMonthData.data?.transactions?.total || 0;

      // Filter low stock products (stock <= 5)
      const lowStock = (productsData.data || []).filter(
        (product: any) =>
          product.is_active &&
          product.product_min_stock !== null &&
          product.product_qty < product.product_min_stock
      );
      setLowStockProducts(lowStock);

      // Calculate growth percentage
      let growthPercentage = 0;
      if (lastRevenue > 0) {
        growthPercentage = ((currentRevenue - lastRevenue) / lastRevenue) * 100;
      } else if (currentRevenue > 0) {
        growthPercentage = 100;
      }

      // Format data
      setStatsData({
        totalRevenue: formatRupiah(currentRevenue),
        totalProducts: totalProducts.toString(),
        totalTransactions: totalTransactions.toString(),
        growth: `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%`,
      });

      // Set stock movement statistics
      setStockMovementStats({
        incomingTotal: (stockMovementData.data?.incoming_total || 0).toString(),
        returnTotal: (stockMovementData.data?.return_total || 0).toString(),
        outgoingTransactionTotal: (stockMovementData.data?.outgoing_transaction_total || 0).toString(),
        outgoingNonTransactionTotal: (stockMovementData.data?.outgoing_nontransaction_total || 0).toString(),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Produk",
      value: statsData.totalProducts,
      icon: Package,
      color: "#3b82f6",
      bgColor: "#1e3a8a",
    },
    {
      title: "Transaksi",
      value: statsData.totalTransactions,
      icon: Users,
      color: "#f59e0b",
      bgColor: "#78350f",
    },
    {
      title: "Barang Masuk",
      value: stockMovementStats.incomingTotal,
      icon: TrendingUp,
      color: "#10b981",
      bgColor: "#065f46",
    },
    {
      title: "Barang Retur",
      value: stockMovementStats.returnTotal,
      icon: Package,
      color: "#06b6d4",
      bgColor: "#164e63",
    },
    {
      title: "Keluar (Transaksi)",
      value: stockMovementStats.outgoingTransactionTotal,
      icon: DollarSign,
      color: "#8b5cf6",
      bgColor: "#5b21b6",
    },
    {
      title: "Keluar (Lainnya)",
      value: stockMovementStats.outgoingNonTransactionTotal,
      icon: Package,
      color: "#ef4444",
      bgColor: "#991b1b",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Selamat Datang,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.user_name || "Admin"}</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{getCurrentDate()}</Text>
        </View>
        <View style={styles.headerActions}>
          <NotificationIcon />
          <TouchableOpacity
            onPress={() => router.push("/(admin)/settings")}
            style={styles.settingsBtn}
          >
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          {/* Total Pendapatan - Prominent */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat statistik...</Text>
            </View>
          ) : (
            <>
              <View style={styles.revenueContainer}>
                <Text style={[styles.revenueLabel, { color: colors.textSecondary }]}>Total Pendapatan</Text>
                <Text style={[styles.revenueValue, { color: colors.text }]}>{statsData.totalRevenue}</Text>
                <Text style={[styles.revenueSubtext, { color: colors.textSecondary }]}>Bulan ini</Text>
              </View>

              {/* Smaller Stats Cards */}
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => {
                  return (
                    <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
                      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* Low Stock Alert */}
        {!loading && lowStockProducts.length > 0 && (
          <View style={styles.lowStockSection}>
            <View style={styles.lowStockHeader}>
              <Text style={[styles.lowStockTitle, { color: colors.text }]}>⚠️ Stok Rendah</Text>
              <Text style={[styles.lowStockCount, { color: colors.textSecondary }]}>
                {lowStockProducts.length} produk
              </Text>
            </View>
            <View style={[styles.lowStockCard, { backgroundColor: colors.card }]}>
              {lowStockProducts.slice(0, 5).map((product, index) => (
                <View
                  key={product.product_id}
                  style={[
                    styles.lowStockItem,
                    index < lowStockProducts.slice(0, 5).length - 1 && styles.lowStockItemBorder,
                    { borderBottomColor: colors.border || 'rgba(255,255,255,0.1)' }
                  ]}
                >
                  <View style={styles.lowStockItemLeft}>
                    <Text style={[styles.lowStockProductName, { color: colors.text }]} numberOfLines={1}>
                      {product.product_name}
                    </Text>
                    {product.m_category && (
                      <Text style={[styles.lowStockCategory, { color: colors.textSecondary }]} numberOfLines={1}>
                        {product.m_category.category_name}
                      </Text>
                    )}
                  </View>
                  <View style={styles.lowStockItemRight}>
                    <Text style={[styles.lowStockQuantity, { color: '#ef4444' }]}>
                      {product.product_qty}
                    </Text>
                    <Text style={[styles.lowStockLabel, { color: colors.textSecondary }]}>stok</Text>
                  </View>
                </View>
              ))}
              {lowStockProducts.length > 5 && (
                <TouchableOpacity
                  style={styles.lowStockMore}
                  onPress={() => router.push("/(admin)/products")}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.lowStockMoreText, { color: colors.primary }]}>
                    Lihat {lowStockProducts.length - 5} produk lainnya
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Revenue Chart */}
        <View style={styles.chartSection}>
          <RevenueChart />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => router.push("/(admin)/products")}
              activeOpacity={0.7}
            >
              <Package size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Kelola Produk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => router.push("/(admin)/stock")}
              activeOpacity={0.7}
            >
              <Package size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Kelola Stok</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
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
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    opacity: 0.7,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingsBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  lowStockSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  lowStockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lowStockTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  lowStockCount: {
    fontSize: 13,
  },
  lowStockCard: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lowStockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  lowStockItemBorder: {
    borderBottomWidth: 1,
  },
  lowStockItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  lowStockProductName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  lowStockCategory: {
    fontSize: 12,
    opacity: 0.6,
  },
  lowStockItemRight: {
    alignItems: "flex-end",
  },
  lowStockQuantity: {
    fontSize: 20,
    fontWeight: "700",
  },
  lowStockLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  lowStockMore: {
    padding: 16,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  lowStockMoreText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  revenueContainer: {
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  revenueLabel: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.6,
    marginBottom: 12,
    fontWeight: "600",
  },
  revenueValue: {
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  revenueSubtext: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 0,
  },
  loadingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    maxWidth: "48%",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    opacity: 0.6,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  quickActions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
