import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { TrendingUp, Calendar, DollarSign, Users, BarChart3, PieChart, Filter } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import RevenueChart from "../../src/components/shared/RevenueChart";
import { useTheme } from "../../src/context/ThemeContext";

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
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

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

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
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
      title: "Total Revenue",
      value: formatCurrency(analyticsData.revenue),
      change: "+18.5%",
      color: "#10b981",
      icon: DollarSign,
    },
    {
      title: "Profit Margin",
      value: `${calculateProfitMargin()}%`,
      change: "+2.3%",
      color: "#3b82f6",
      icon: TrendingUp,
    },
    {
      title: "Total Transactions",
      value: analyticsData.transactions.toLocaleString(),
      change: "+12.4%",
      color: "#f59e0b",
      icon: BarChart3,
    },
    {
      title: "Active Customers",
      value: analyticsData.customers.toLocaleString(),
      change: "+8.7%",
      color: "#ec4899",
      icon: Users,
    },
  ];

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      <Filter size={16} color={colors.textSecondary} />
      {timeRanges.map((range) => (
        <TouchableOpacity
          key={range.key}
          style={[
            styles.timeRangeButton,
            {
              backgroundColor: timeRange === range.key ? colors.primary : colors.card,
              borderColor: colors.border,
            }
          ]}
          onPress={() => setTimeRange(range.key as any)}
        >
          <Text
            style={[
              styles.timeRangeText,
              {
                color: timeRange === range.key ? '#ffffff' : colors.text,
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
          <View key={index} style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                <Icon size={20} color={metric.color} />
              </View>
              <Text style={[styles.metricChange, { color: metric.color }]}>
                {metric.change}
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {metric.value}
            </Text>
            <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>
              {metric.title}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderProfitAnalysis = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Profit Analysis</Text>
      <View style={styles.profitContainer}>
        <View style={styles.profitItem}>
          <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Revenue</Text>
          <Text style={[styles.profitValue, { color: colors.primary }]}>
            {formatCurrency(analyticsData.revenue)}
          </Text>
          <View style={[styles.profitBar, { backgroundColor: `${colors.primary}20` }]}>
            <View
              style={[
                styles.profitFill,
                { backgroundColor: colors.primary, width: '75%' }
              ]}
            />
          </View>
        </View>
        <View style={styles.profitItem}>
          <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Expenses</Text>
          <Text style={[styles.profitValue, { color: '#ef4444' }]}>
            {formatCurrency(analyticsData.expenses)}
          </Text>
          <View style={[styles.profitBar, { backgroundColor: '#ef444420' }]}>
            <View
              style={[
                styles.profitFill,
                { backgroundColor: '#ef4444', width: '55%' }
              ]}
            />
          </View>
        </View>
        <View style={styles.profitItem}>
          <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Profit</Text>
          <Text style={[styles.profitValue, { color: '#10b981' }]}>
            {formatCurrency(analyticsData.profit)}
          </Text>
          <View style={[styles.profitBar, { backgroundColor: '#10b98120' }]}>
            <View
              style={[
                styles.profitFill,
                { backgroundColor: '#10b981', width: '32%' }
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmployeePerformance = () => (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Performers</Text>
      {analyticsData.employeePerformance.slice(0, 3).map((employee, index) => (
        <View key={index} style={styles.employeeItem}>
          <View style={styles.employeeInfo}>
            <Text style={[styles.employeeName, { color: colors.text }]}>
              {employee.name}
            </Text>
            <Text style={[styles.employeeStats, { color: colors.textSecondary }]}>
              {employee.transactions} transactions • {formatCurrency(employee.revenue)}
            </Text>
          </View>
          <View style={styles.employeeRating}>
            <Text style={[styles.ratingValue, { color: colors.primary }]}>
              {employee.rating}
            </Text>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
              Rating
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerLeft}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Business intelligence dashboard
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Time Range Selector */}
        {renderTimeRangeSelector()}

        {/* Key Metrics */}
        {renderKeyMetrics()}

        {/* Revenue Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenue Trends</Text>
          <RevenueChart />
        </View>

        {/* Profit Analysis */}
        {renderProfitAnalysis()}

        {/* Employee Performance */}
        {renderEmployeePerformance()}

        {/* Business Insights */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Insights</Text>
          <View style={styles.insightList}>
            <View style={styles.insightItem}>
              <View style={[styles.insightDot, { backgroundColor: '#10b981' }]} />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Revenue increased by 18.5% compared to last month
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={[styles.insightDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Average transaction value: {formatCurrency(Math.round(analyticsData.revenue / analyticsData.transactions))}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={[styles.insightDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Peak business hours: 10 AM - 2 PM
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  // Time range selector
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Key metrics
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
  },
  // Section
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  // Profit analysis
  profitContainer: {
    gap: 16,
  },
  profitItem: {
    gap: 8,
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
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  profitFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Employee performance
  employeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  employeeStats: {
    fontSize: 12,
  },
  employeeRating: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  ratingLabel: {
    fontSize: 10,
  },
  // Business insights
  insightList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  insightText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});