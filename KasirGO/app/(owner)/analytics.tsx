import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from "react-native";
import { BanknoteArrowUp, BanknoteArrowDown, TrendingUp, Calendar, DollarSign, Users, BarChart3, PieChart, Filter, Settings, Activity, Target, ShoppingCart, Star, Wallet } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import TopSellingProducts from "../../src/components/owner/TopSellingProducts";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import { getFinancialSummary, getRevenueReport, getEmployeePerformance } from "../../src/api/financial";
import { getCashFlowSummary, getExpenseByCategory } from "../../src/api/cashTransaction";
import { formatCurrency, formatPercentage } from "../../src/utils/financial.helpers";

const { width: screenWidth } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [employeeData, setEmployeeData] = useState<any[]>([]);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [expenseByCategory, setExpenseByCategory] = useState<any>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    fetchAnalyticsData();
  }, [timeRange]);


  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      let startDate: Date;

      if (timeRange === 'week') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
      } else {
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const filters = {
        start_date: formatLocalDate(startDate),
        end_date: formatLocalDate(now),
      };

      const [summaryRes, revenueRes, employeeRes, cashFlowRes, expenseCategoryRes] = await Promise.all([
        getFinancialSummary(filters),
        getRevenueReport({ ...filters, group_by: timeRange === 'week' ? 'day' : timeRange === 'month' ? 'week' : 'month' }),
        getEmployeePerformance({ ...filters, limit: 5 }),
        getCashFlowSummary(filters.start_date, filters.end_date),
        getExpenseByCategory(filters.start_date, filters.end_date)
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data || []);
      if (employeeRes.success) setEmployeeData(employeeRes.data || []);
      if (cashFlowRes.success) setCashFlow(cashFlowRes.data);
      if (expenseCategoryRes.success && expenseCategoryRes.data) {
        console.log('===== EXPENSE CATEGORIES DEBUG =====');
        console.log('Total from API:', expenseCategoryRes.data.total_expense);
        console.log('All categories:', expenseCategoryRes.data.categories);

        const filteredCategories = expenseCategoryRes.data.categories.filter(cat =>
          cat.category_code !== 'PURCHASE_INVENTORY' && cat.category_code !== 'RETURN_REFUND'
        );
        const filteredTotal = filteredCategories.reduce((sum, cat) => sum + cat.total_amount, 0);

        console.log('Filtered categories:', filteredCategories);
        console.log('Filtered total:', filteredTotal);
        console.log('Categories excluded:', expenseCategoryRes.data.categories.filter(cat =>
          cat.category_code === 'PURCHASE_INVENTORY' || cat.category_code === 'RETURN_REFUND'
        ));

        setExpenseByCategory({
          total_expense: filteredTotal,
          categories: filteredCategories
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };


  const timeRanges = [
    { key: 'week' as const, label: '7 Hari' },
    { key: 'month' as const, label: '30 Hari' },
    { key: 'year' as const, label: '1 Tahun' },
  ];

  if (loading || !summary) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat data analytics...</Text>
        </View>
        <OwnerBottomNav />
      </View>
    );
  }

  const keyMetrics = [
    {
      title: "Total Pendapatan",
      value: formatCurrency(summary.revenue.total),
      color: "#10b981",
      icon: BanknoteArrowUp,
    },
    {
      title: "Rata-rata Margin",
      value: formatPercentage(summary.revenue.profitMargin),
      color: "#3b82f6",
      icon: TrendingUp,
    },
    {
      title: "Total Transaksi",
      value: summary.transactions.total.toLocaleString(),
      color: "#f59e0b",
      icon: ShoppingCart,
    },
    {
      title: "Total Pengeluaran",
      value: formatCurrency(expenseByCategory?.total_expense || 0),
      color: "#ef4444",
      icon: BanknoteArrowDown,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
        <TouchableOpacity onPress={() => router.push("/(owner)/settings")} style={styles.settingsBtn}>
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Time Range Selector */}
          <View style={styles.timeRangeContainer}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[
                  styles.timeRangeButton,
                  timeRange === range.key && { backgroundColor: colors.primary },
                  { borderColor: colors.border }
                ]}
                onPress={() => setTimeRange(range.key)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    { color: timeRange === range.key ? '#ffffff' : colors.textSecondary }
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            {keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <View key={index} style={[styles.metricCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.metricIconContainer, { backgroundColor: `${metric.color}15` }]}>
                    <Icon size={24} color={metric.color} />
                  </View>
                  <Text style={[styles.metricValue, { color: colors.text }]}>{metric.value}</Text>
                  <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{metric.title}</Text>
                </View>
              );
            })}
          </View>

          {/* Cash Drawer Summary */}
          {summary.cashDrawer && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cash Drawer Status</Text>
              <View style={styles.cashDrawerGrid}>
                <View style={styles.cashDrawerItem}>
                  <Text style={[styles.cashDrawerLabel, { color: colors.textSecondary }]}>Shift Aktif</Text>
                  <Text style={[styles.cashDrawerValue, { color: colors.text }]}>
                    {summary.cashDrawer.openDrawers}
                  </Text>
                </View>
                <View style={styles.cashDrawerItem}>
                  <Text style={[styles.cashDrawerLabel, { color: colors.textSecondary }]}>Cash di Drawer</Text>
                  <Text style={[styles.cashDrawerValue, { color: colors.text }]}>
                    {formatCurrency(summary.cashDrawer.totalCashInOpenDrawers)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Top Selling Products */}
          <View style={styles.chartSection}>
            <TopSellingProducts timeRange={timeRange} limit={5} />
          </View>

          {/* Employee Performance */}
          {employeeData.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Performa Kasir</Text>
                <Users size={20} color={colors.primary} />
              </View>
              {employeeData.map((employee, index) => (
                <View key={index} style={[styles.employeeItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.employeeRank}>
                    {index === 0 && <Star size={20} color="#FFD700" fill="#FFD700" />}
                    {index > 0 && <Text style={[styles.rankNumber, { color: colors.textSecondary }]}>#{index + 1}</Text>}
                  </View>
                  <View style={styles.employeeInfo}>
                    <Text style={[styles.employeeName, { color: colors.text }]}>{employee.name}</Text>
                    <Text style={[styles.employeeStats, { color: colors.textSecondary }]}>
                      {employee.transactions} transaksi • {formatCurrency(employee.revenue)}
                    </Text>
                  </View>
                  <View style={[styles.avgBadge, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.avgText, { color: colors.primary }]}>
                      {formatCurrency(employee.averageTransaction)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Payment Methods Breakdown */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Metode Pembayaran</Text>
              <PieChart size={20} color={colors.primary} />
            </View>
            <View style={styles.paymentMethodsGrid}>
              {Object.entries(summary.transactions.byPaymentMethod).map(([method, amount]: [string, any]) => {
                const total = summary.revenue.total;
                const percentage = ((amount / total) * 100).toFixed(1);
                const methodColors: any = {
                  CASH: "#10b981",
                  QRIS: "#3b82f6",
                  DEBIT: "#f59e0b"
                };

                return (
                  <View key={method} style={styles.paymentMethodItem}>
                    <View style={[styles.paymentMethodBar, { backgroundColor: `${methodColors[method]}15` }]}>
                      <View
                        style={[
                          styles.paymentMethodFill,
                          { width: `${percentage}%` as any, backgroundColor: methodColors[method] }
                        ]}
                      />
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={[styles.paymentMethodName, { color: colors.text }]}>{method}</Text>
                      <Text style={[styles.paymentMethodValue, { color: colors.textSecondary }]}>
                        {formatCurrency(amount)} ({percentage}%)
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {cashFlow && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Arus Kas</Text>
                <Activity size={20} color={colors.primary} />
              </View>
              <View style={styles.cashFlowGrid}>
                <View style={[styles.cashFlowItem, { backgroundColor: '#10b98115' }]}>
                  <BanknoteArrowUp size={20} color="#10b981" />
                  <Text style={[styles.cashFlowLabel, { color: colors.textSecondary }]}>Pemasukan</Text>
                  <Text style={[styles.cashFlowValue, { color: '#10b981' }]}>
                    {formatCurrency(cashFlow.total_income)}
                  </Text>
                </View>
                <View style={[styles.cashFlowItem, { backgroundColor: '#ef444415' }]}>
                  <BanknoteArrowDown size={20} color="#ef4444" />
                  <Text style={[styles.cashFlowLabel, { color: colors.textSecondary }]}>Pengeluaran</Text>
                  <Text style={[styles.cashFlowValue, { color: '#ef4444' }]}>
                    {formatCurrency(expenseByCategory?.total_expense || 0)}
                  </Text>
                </View>
                <View style={[styles.cashFlowItem, { backgroundColor: '#3b82f615' }]}>
                  <Wallet size={20} color="#3b82f6" />
                  <Text style={[styles.cashFlowLabel, { color: colors.textSecondary }]}>Arus Kas Bersih</Text>
                  <Text style={[styles.cashFlowValue, { color: '#3b82f6' }]}>
                    {formatCurrency(cashFlow.total_income - (expenseByCategory?.total_expense || 0))}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {expenseByCategory && expenseByCategory.categories.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Pengeluaran per Kategori</Text>
                <BanknoteArrowDown size={20} color="#ef4444" />
              </View>
              {expenseByCategory.categories.slice(0, 5).map((cat: any, index: number) => {
                const percentage = ((cat.total_amount / expenseByCategory.total_expense) * 100).toFixed(1);
                const percentageNum = parseFloat(percentage);
                return (
                  <View key={index} style={[styles.expenseCategoryItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.expenseCategoryInfo}>
                      <Text style={[styles.expenseCategoryName, { color: colors.text }]}>{cat.category_name}</Text>
                      <View style={[styles.progressBarContainer, { backgroundColor: colors.background }]}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${percentageNum}%` as any,
                              backgroundColor: '#ef4444'
                            }
                          ]}
                        />
                      </View>
                      <Text style={[styles.expenseCategoryCount, { color: colors.textSecondary }]}>
                        {cat.transaction_count} transaksi • {percentage}%
                      </Text>
                    </View>
                    <Text style={[styles.expenseAmount, { color: '#ef4444' }]}>
                      {formatCurrency(cat.total_amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 100 }} />
        </Animated.View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  settingsBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: (screenWidth - 52) / 2,
    padding: 16,
    borderRadius: 16,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  cashDrawerGrid: {
    flexDirection: "row",
    gap: 16,
  },
  cashDrawerItem: {
    flex: 1,
  },
  cashDrawerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  cashDrawerValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  employeeRank: {
    width: 32,
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "600",
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  employeeStats: {
    fontSize: 13,
  },
  avgBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  avgText: {
    fontSize: 12,
    fontWeight: "700",
  },
  paymentMethodsGrid: {
    gap: 16,
  },
  paymentMethodItem: {
    gap: 8,
  },
  paymentMethodBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  paymentMethodFill: {
    height: "100%",
    borderRadius: 4,
  },
  paymentMethodInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: "600",
  },
  paymentMethodValue: {
    fontSize: 13,
  },
  profitSection: {
    alignItems: "center",
    borderWidth: 2,
  },
  profitLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  profitValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  profitSubtext: {
    fontSize: 12,
  },
  cashFlowGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  cashFlowItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  cashFlowLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  cashFlowValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  expenseCategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  expenseCategoryInfo: {
    flex: 1,
  },
  expenseCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  expenseCategoryCount: {
    fontSize: 12,
  },
  expenseCategoryValue: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  expensePercentage: {
    fontSize: 11,
  },
});