import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { ShoppingCart, DollarSign, TrendingUp, Settings } from "lucide-react-native";
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function CashierDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const stats = [
    {
      title: "Today's Sales",
      value: "Rp 2,450,000",
      icon: DollarSign,
      color: "#10b981",
      bgColor: "#064e3b",
    },
    {
      title: "Transactions",
      value: "42",
      icon: ShoppingCart,
      color: "#3b82f6",
      bgColor: "#1e3a8a",
    },
    {
      title: "Avg. Sale",
      value: "Rp 58,333",
      icon: TrendingUp,
      color: "#f59e0b",
      bgColor: "#78350f",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Halo,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.userName || "Kasir"}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/(cashier)/settings")} 
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={[styles.statCard, { borderLeftColor: stat.color, backgroundColor: colors.card }]}>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Icon size={24} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick Action - Start Transaction */}
        <TouchableOpacity 
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(cashier)/workspace")}
        >
          <ShoppingCart size={24} color="#ffffff" />
          <Text style={styles.startButtonText}>Mulai Transaksi Baru</Text>
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaksi Terkini</Text>
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Belum ada transaksi</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Mulai berjualan untuk melihat transaksi</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <CashierBottomNav />
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
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  settingsBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
    gap: 12,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    position: "absolute",
    right: 16,
    top: 16,
  },
  startButton: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});
