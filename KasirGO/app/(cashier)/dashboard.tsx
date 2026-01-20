import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { ShoppingCart, DollarSign, TrendingUp, Settings, Clock, BanknoteArrowUp, Wallet } from "lucide-react-native";
import CashierSidebar from "../../src/components/navigation/CashierSidebar";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { transactionService, Transaction } from "../../src/api/transaction";
import TopSellingProducts from "../../src/components/cashier/TopSellingProducts";
import PaymentMethodStats from "../../src/components/cashier/PaymentMethodStats";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp');
};

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
};

const getPaymentMethodColor = (method: string): string => {
  switch (method?.toUpperCase()) {
    case 'CASH':
      return '#10b981'; // Green
    case 'QRIS':
      return '#3b82f6'; // Blue
    case 'DEBIT':
      return '#8b5cf6'; // Purple
    default:
      return '#6b7280'; // Gray
  }
};

const getPaymentMethodBg = (method: string): string => {
  switch (method?.toUpperCase()) {
    case 'CASH':
      return '#d1fae5'; // Light green
    case 'QRIS':
      return '#dbeafe'; // Light blue
    case 'DEBIT':
      return '#ede9fe'; // Light purple
    default:
      return '#f3f4f6'; // Light gray
  }
};

export default function CashierDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [todaySales, setTodaySales] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState({
    CASH: { total: 0, count: 0 },
    QRIS: { total: 0, count: 0 },
    DEBIT: { total: 0, count: 0 }
  });
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());

  useEffect(() => {
    fetchDashboardStats();
    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getDashboardStats();
      if (response.success && response.data) {
        setTodaySales(response.data.todaySales);
        setTransactionCount(response.data.transactionCount);
        setRecentTransactions(response.data.recentTransactions);
        setPaymentMethodBreakdown(response.data.paymentMethodBreakdown);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Penjualan Hari Ini",
      value: formatCurrency(todaySales),
      icon: BanknoteArrowUp,
      color: "#10b981",
      gradient: ["#10b981", "#059669"],
    },
    {
      title: "Total Transaksi",
      value: transactionCount.toString(),
      icon: ShoppingCart,
      color: "#3b82f6",
      gradient: ["#3b82f6", "#2563eb"],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.landscapeMaster}>
        <CashierSidebar />
        <View style={styles.landscapeContent}>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting},</Text>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.user_name || "Kasir"}</Text>
            </View>
            <View style={styles.lastUpdateContainer}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={[styles.lastUpdateText, { color: colors.textSecondary }]}>
                Diperbarui baru saja
              </Text>
            </View>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Memuat data...
                </Text>
              </View>
            ) : (
              <View style={styles.contentContainer}>
                {/* Left Column - Statistics */}
                <View style={styles.leftColumn}>
                  <View style={styles.statsContainer}>
                    {stats.map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <View
                          key={index}
                          style={[
                            styles.statCard,
                            {
                              backgroundColor: colors.card,
                              shadowColor: stat.color,
                            }
                          ]}
                        >
                          <View style={styles.statCardHeader}>
                            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                              <Icon size={28} color={stat.color} strokeWidth={2.5} />
                            </View>
                            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                              {stat.title}
                            </Text>
                          </View>
                          <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.paymentMethodSection}>
                    <PaymentMethodStats paymentMethodBreakdown={paymentMethodBreakdown} />
                  </View>
                </View>

                {/* Right Column - Transactions & Top Products */}
                <View style={styles.rightColumn}>
                  <View style={styles.section}>
                    <TouchableOpacity
                      onPress={() => router.push('/(cashier)/history')}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.transactionOuterCard, { backgroundColor: colors.card }]}>
                        <View style={styles.transactionCardHeader}>
                          <Text style={[styles.transactionCardTitle, { color: colors.textSecondary }]}>
                            3 Transaksi Terakhir Hari Ini
                          </Text>
                        </View>
                        {recentTransactions.length > 0 ? (
                          <View style={styles.transactionsContainer}>
                            {recentTransactions.slice(0, 3).map((transaction, index) => {
                              const paymentColor = getPaymentMethodColor(transaction.paymentMethod || 'CASH');
                              const paymentBg = getPaymentMethodBg(transaction.paymentMethod || 'CASH');

                              return (
                                <View
                                  key={transaction.id}
                                  style={[
                                    styles.transactionCard,
                                    {
                                      backgroundColor: colors.background,
                                      shadowColor: colors.text,
                                    }
                                  ]}
                                >
                                  <View style={styles.transactionHeader}>
                                    <View style={styles.transactionIdContainer}>
                                      <Text style={[styles.transactionId, { color: colors.text }]}>
                                        #{transaction.dailyNumber || transaction.id}
                                      </Text>
                                      <View style={[styles.paymentBadge, { backgroundColor: paymentBg }]}>
                                        <Text style={[styles.paymentBadgeText, { color: paymentColor }]}>
                                          {transaction.paymentMethod || 'CASH'}
                                        </Text>
                                      </View>
                                    </View>
                                    <Text style={[styles.transactionTotal, { color: colors.text }]}>
                                      {formatCurrency(transaction.total)}
                                    </Text>
                                  </View>
                                  <View style={styles.transactionDetails}>
                                    <Text style={[styles.transactionItems, { color: colors.textSecondary }]}>
                                      {transaction.items.length} item{transaction.items.length > 1 ? 's' : ''}
                                    </Text>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        ) : (
                          <View style={styles.emptyTransactionCard}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
                              <ShoppingCart size={40} color={colors.textSecondary} />
                            </View>
                            <Text style={[styles.emptyText, { color: colors.text }]}>
                              Belum ada transaksi
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                              Transaksi yang dilakukan hari ini akan muncul di sini
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.section}>
                    <TopSellingProducts />
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  greeting: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  lastUpdateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  lastUpdateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  settingsBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  contentContainer: {
    flexDirection: "row",
    flex: 1,
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  statsContainer: {
    gap: 20,
  },
  statCard: {
    padding: 24,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 24,
  },
  paymentMethodSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  transactionOuterCard: {
    padding: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionCardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  transactionCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionsContainer: {
    gap: 12,
    minHeight: 258,
  },
  transactionCard: {
    padding: 18,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTransactionCard: {
    padding: 40,
    alignItems: 'center',
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  transactionIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  transactionTotal: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  transactionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  transactionItems: {
    fontSize: 13,
    fontWeight: "500",
  },
  transactionMethod: {
    fontSize: 14,
  },
  emptyCard: {
    padding: 48,
    borderRadius: 16,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  landscapeMaster: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeContent: {
    flex: 1,
    flexDirection: 'column',
  },
});
