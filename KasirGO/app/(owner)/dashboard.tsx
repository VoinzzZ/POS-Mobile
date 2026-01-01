import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { DollarSign, TrendingUp, Users, Briefcase, Settings } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import RevenueChart from "../../src/components/shared/RevenueChart";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const stats = [
    {
      title: "Total Pendapatan",
      value: "Rp 24,500,000",
      icon: DollarSign,
      color: "#10b981",
      bgColor: "#064e3b",
    },
    {
      title: "Margin Laba",
      value: "32.5%",
      icon: TrendingUp,
      color: "#3b82f6",
      bgColor: "#1e3a8a",
    },
    {
      title: "Total Transaksi",
      value: "3,247",
      icon: Briefcase,
      color: "#f59e0b",
      bgColor: "#78350f",
    },
    {
      title: "Karyawan",
      value: "12",
      icon: Users,
      color: "#ec4899",
      bgColor: "#831843",
    },
  ];

  const quickActions = [
    {
      title: "Lihat Analitik",
      icon: TrendingUp,
      route: "/(owner)/analytics",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Selamat Datang Kembali,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || user?.user_name || "Pemilik"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(owner)/settings")}
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
                <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                  <Icon size={24} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
              </View>
            );
          })}
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartSection}>
          <RevenueChart />
        </View>

        {/* Business Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Wawasan Bisnis</Text>
          <View style={[styles.insightsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Pertumbuhan Bulanan</Text>
            <Text style={[styles.insightValue, { color: colors.primary }]}>+18.5%</Text>
            <Text style={[styles.insightSubtext, { color: colors.textSecondary }]}>Dibanding bulan lalu</Text>
          </View>
        </View>

        
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionButton, { backgroundColor: colors.card }]}
                  onPress={() => {
                    router.push(action.route as any);
                  }}
                >
                  <Icon size={20} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
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
  insightsCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  insightTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  insightSubtext: {
    fontSize: 12,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});