import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { DollarSign, Package, Users, TrendingUp, Settings } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import RevenueChart from "../../src/components/shared/RevenueChart";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const stats = [
    {
      title: "Total Revenue",
      value: "Rp 12,500,000",
      icon: DollarSign,
      color: "#10b981",
      bgColor: "#064e3b",
    },
    {
      title: "Products",
      value: "248",
      icon: Package,
      color: "#3b82f6",
      bgColor: "#1e3a8a",
    },
    {
      title: "Customers",
      value: "1,234",
      icon: Users,
      color: "#f59e0b",
      bgColor: "#78350f",
    },
    {
      title: "Growth",
      value: "+23%",
      icon: TrendingUp,
      color: "#ec4899",
      bgColor: "#831843",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Selamat Datang Kembali,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.user_name || "Admin"}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/(admin)/settings")} 
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

        {/* Revenue Chart */}
        <View style={styles.chartSection}>
          <RevenueChart />
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aktivitas Terkini</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.activityText, { color: colors.textSecondary }]}>Belum ada transaksi</Text>
            <Text style={[styles.activitySubtext, { color: colors.textSecondary }]}>Data transaksi akan muncul di sini</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
              <Package size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Tambah Produk</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]}>
              <Users size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Tambah Pengguna</Text>
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
    borderLeftWidth: 4,
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
  activityCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  activityText: {
    fontSize: 16,
    marginBottom: 4,
  },
  activitySubtext: {
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
