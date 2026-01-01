import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from "react-native";
import { TrendingUp, Calendar, DollarSign, Users, BarChart3, PieChart, Filter, Settings, Activity, Target, ShoppingCart, Star } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import RevenueChart from "../../src/components/shared/RevenueChart";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  revenue: number;
  profit: number;
  expenses: number;
  transactions: number;
  customers: number;
  employeePerformance: Array<{
    name: string;
    transactions: number;
    revenue: number;
    rating: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    profit: number;
    transactions: number;
  }>;
}

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const [analyticsData] = useState<AnalyticsData>({
    revenue: 24500000,
    profit: 7850000,
    expenses: 16650000,
    transactions: 3427,
    customers: 1247,
    employeePerformance: [
      { name: "John Doe", transactions: 342, revenue: 8500000, rating: 4.5 },
      { name: "Jane Smith", transactions: 528, revenue: 12300000, rating: 4.8 },
      { name: "Bob Johnson", transactions: 156, revenue: 4200000, rating: 4.2 },
      { name: "Alice Brown", transactions: 289, revenue: 7800000, rating: 4.6 },
    ],
    monthlyTrends: [
      { month: "Jan", revenue: 18000000, profit: 5200000, transactions: 2432 },
      { month: "Feb", revenue: 22000000, profit: 6800000, transactions: 2987 },
      { month: "Mar", revenue: 24500000, profit: 7850000, transactions: 3427 },
    ],
  });

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const calculateProfitMargin = () => {
    return ((analyticsData.profit / analyticsData.revenue) * 100).toFixed(1);
  };

  const timeRanges = [
    { key: 'week', label: '7 Hari' },
    { key: 'month', label: '30 Hari' },
    { key: 'year', label: '1 Tahun' },
  ];

  const keyMetrics = [
    {
      title: "Total Pendapatan",
      value: formatCurrency(analyticsData.revenue),
      change: "+18.5%",
      color: "#10b981",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Margin Laba",
      value: `${calculateProfitMargin()}%`,
      change: "+2.3%",
      color: "#3b82f6",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Total Transaksi",
      value: analyticsData.transactions.toLocaleString(),
      change: "+12.4%",
      color: "#f59e0b",
      icon: ShoppingCart,
      trend: "up"
    },
    {
      title: "Jumlah Pelanggan Aktif",
      value: analyticsData.customers.toLocaleString(),
      change: "+8.7%",
      color: "#ec4899",
      icon: Users,
      trend: "up"
    },
  ];

  const renderTimeRangeSelector = () => (
    <View style={[styles.timeRangeContainer, { backgroundColor: colors.card }]}>
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range.key}
          style={[
            styles.timeRangeButton,
            {
              backgroundColor: timeRange === range.key ? colors.primary : 'transparent',
              borderColor: timeRange === range.key ? colors.primary : colors.border,
              borderWidth: 1,
            }
          ]}
          onPress={() => setTimeRange(range.key as any)}
        >
          <Text
            style={[
              styles.timeRangeText,
              {
                color: timeRange === range.key ? '#ffffff' : colors.textSecondary,
                fontWeight: timeRange === range.key ? '700' : '600',
              }
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderKeyMetrics = () => (
    <View style={styles.metricsContainer}>
      {keyMetrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Animated.View
            key={index}
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              },
              { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
            ]}
          >
            <View style={styles.metricHeader}>
              <View style={[styles.metricIcon, { backgroundColor: `${metric.color}15` }]}>
                <Icon size={24} color={metric.color} />
              </View>
              <View style={styles.metricContent}>
                <View style={styles.metricTitleRow}>
                  <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
                    {metric.title}
                  </Text>
                  <View style={[styles.metricBadge, { backgroundColor: `${metric.color}20` }]}>
                    <Text style={[styles.metricChange, { color: metric.color }]}>
                      {metric.change}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.metricValue, { color: colors.text }]}>
                  {metric.value}
                </Text>
              </View>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );

  const renderProfitAnalysis = () => (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Analisis Laba</Text>
      <View style={styles.profitContainer}>
        <View style={styles.profitItem}>
          <View style={styles.profitHeader}>
            <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Pendapatan</Text>
            <Text style={[styles.profitValue, { color: colors.primary }]}>
              {formatCurrency(analyticsData.revenue)}
            </Text>
          </View>
          <View style={[styles.profitBar, { backgroundColor: `${colors.primary}15` }]}>
            <View
              style={[
                styles.profitFill,
                { backgroundColor: colors.primary, width: '100%' }
              ]}
            />
          </View>
        </View>
        <View style={styles.profitItem}>
          <View style={styles.profitHeader}>
            <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Pengeluaran</Text>
            <Text style={[styles.profitValue, { color: colors.error }]}>
              {formatCurrency(analyticsData.expenses)}
            </Text>
          </View>
          <View style={[styles.profitBar, { backgroundColor: `${colors.error}15` }]}>
            <View
              style={[
                styles.profitFill,
                { backgroundColor: colors.error, width: '68%' }
              ]}
            />
          </View>
        </View>
        <View style={styles.profitItem}>
          <View style={styles.profitHeader}>
            <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Laba</Text>
            <Text style={[styles.profitValue, { color: colors.success }]}>
              {formatCurrency(analyticsData.profit)}
            </Text>
          </View>
          <View style={[styles.profitBar, { backgroundColor: `${colors.success}15` }]}>
            <View
              style={[
                styles.profitFill,
                { backgroundColor: colors.success, width: '32%' }
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmployeePerformance = () => (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Karyawan Terbaik</Text>
      {analyticsData.employeePerformance.slice(0, 3).map((employee, index, arr) => (
        <View
          key={index}
          style={[
            styles.employeeItem,
            {
              borderBottomColor: colors.border,
              borderBottomWidth: index < arr.length - 1 ? 1 : 0,
            },
          ]}
        >
          <View style={styles.employeeInfo}>
            <Text style={[styles.employeeName, { color: colors.text }]}>
              {employee.name}
            </Text>
            <Text style={[styles.employeeStats, { color: colors.textSecondary }]}>
              {employee.transactions} transaksi • {formatCurrency(employee.revenue)}
            </Text>
          </View>
          <View style={[styles.employeeRating, { backgroundColor: `${colors.primary}15`, borderRadius: 20, padding: 6 }]}>
            <Star size={16} color={colors.primary} fill={colors.primary} />
            <Text style={[styles.ratingValue, { color: colors.primary, marginLeft: 4 }]}>
              {employee.rating}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>Analitik</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ringkasan Kinerja Bisnis</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(owner)/settings")}
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Revenue Chart - Hero Section at Top */}
        <View style={[styles.chartHeroSection, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <RevenueChart />
        </View>

        {/* Time Range Selector */}
        {renderTimeRangeSelector()}

        {/* Key Metrics */}
        {renderKeyMetrics()}

        {/* Profit Analysis */}
        {renderProfitAnalysis()}

        {/* Employee Performance */}
        {renderEmployeePerformance()}

        {/* Business Insights */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Wawasan Bisnis</Text>
          <View style={styles.insightList}>
            <View style={[styles.insightItem, { backgroundColor: `${colors.success}08`, borderLeftColor: colors.success }]}>
              <Activity size={16} color={colors.success} />
              <Text style={[styles.insightText, { color: colors.text, flex: 1 }]}>
                Pendapatan meningkat 18,5% dibanding bulan lalu
              </Text>
            </View>
            <View style={[styles.insightItem, { backgroundColor: `${colors.info}08`, borderLeftColor: colors.info }]}>
              <Target size={16} color={colors.info} />
              <Text style={[styles.insightText, { color: colors.text, flex: 1 }]}>
                Nilai transaksi rata-rata: {formatCurrency(Math.round(analyticsData.revenue / analyticsData.transactions))}
              </Text>
            </View>
            <View style={[styles.insightItem, { backgroundColor: `${colors.warning}08`, borderLeftColor: colors.warning }]}>
              <BarChart3 size={16} color={colors.warning} />
              <Text style={[styles.insightText, { color: colors.text, flex: 1 }]}>
                Jam sibuk: 10 pagi - 2 siang
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <OwnerBottomNav />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  settingsBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  chartHeroSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 13,
  },
  // Key metrics
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  metricContent: {
    flex: 1,
  },
  metricTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  metricChange: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Section
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  // Profit analysis
  profitContainer: {
    gap: 16,
  },
  profitItem: {
    gap: 12,
  },
  profitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  profitValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  profitBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  profitFill: {
    height: '100%',
    borderRadius: 6,
  },
  // Employee performance
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  employeeStats: {
    fontSize: 13,
  },
  employeeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratingLabel: {
    fontSize: 10,
  },
  // Business insights
  insightList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
});