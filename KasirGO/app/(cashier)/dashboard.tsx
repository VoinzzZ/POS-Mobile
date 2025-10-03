import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { ShoppingCart, DollarSign, TrendingUp, LogOut } from "lucide-react-native";
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";
import { useRouter } from "expo-router";

export default function CashierDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.userName || "Cashier"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#f87171" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Icon size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick Action - Start Transaction */}
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push("/(cashier)/workspace")}
        >
          <ShoppingCart size={24} color="#ffffff" />
          <Text style={styles.startButtonText}>Start New Transaction</Text>
        </TouchableOpacity>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Start selling to see transactions</Text>
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
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#1e293b",
  },
  greeting: {
    fontSize: 14,
    color: "#94a3b8",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginTop: 4,
  },
  logoutBtn: {
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
    backgroundColor: "#1e293b",
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
    color: "#ffffff",
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: "#94a3b8",
    position: "absolute",
    right: 16,
    top: 16,
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: "#4ECDC4",
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
    color: "#ffffff",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#1e293b",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
  },
  emptySubtext: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4,
  },
});
