import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { Package, TrendingDown, AlertTriangle, Settings, Plus, BarChart3 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function InventoryDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const stats = [
    {
      title: "Total Produk",
      value: "1,248",
      icon: Package,
      color: "#10b981",
      bgColor: "#064e3b",
    },
    {
      title: "Stok Menipis",
      value: "23",
      icon: AlertTriangle,
      color: "#ef4444",
      bgColor: "#7f1d1d",
    },
    {
      title: "Stok Baik",
      value: "98%",
      icon: TrendingDown,
      color: "#3b82f6",
      bgColor: "#1e3a8a",
    },
    {
      title: "Kategori",
      value: "45",
      icon: BarChart3,
      color: "#8b5cf6",
      bgColor: "#4c1d95",
    },
  ];

  const lowStockItems = [
    { name: "Indomie Goreng", stock: 5, unit: "pcs" },
    { name: "Kopi ABC", stock: 3, unit: "box" },
    { name: "Teh Gelas", stock: 8, unit: "lusin" },
    { name: "Minyak Goreng", stock: 2, unit: "liter" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Selamat Datang,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.user_name || "Inventory Manager"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(inventory)/settings")}
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

        {/* Low Stock Alert */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Stok Menipis</Text>
            <TouchableOpacity onPress={() => router.push("/(inventory)/stock")}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.alertCard, { backgroundColor: colors.card }]}>
            {lowStockItems.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.stockItem}>
                <View style={styles.stockInfo}>
                  <Text style={[styles.stockName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.stockDetail, { color: colors.textSecondary }]}>
                    Stok: <Text style={[styles.stockValue, { color: colors.error }]}>{item.stock} {item.unit}</Text>
                  </Text>
                </View>
                <TouchableOpacity style={styles.alertBtn}>
                  <Plus size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => router.push("/(inventory)/products")}
            >
              <Package size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Tambah Produk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => router.push("/(inventory)/stock")}
            >
              <BarChart3 size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Kelola Stok</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => router.push("/(inventory)/categories")}
            >
              <BarChart3 size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Kategori</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aktivitas Terkini</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.activityText, { color: colors.textSecondary }]}>Stok "Indomie" ditambah 50 pcs</Text>
            <Text style={[styles.activityTime, { color: colors.textSecondary }]}>2 jam yang lalu</Text>
          </View>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.activityText, { color: colors.textSecondary }]}>Produk "Kopi ABC" habis</Text>
            <Text style={[styles.activityTime, { color: colors.textSecondary }]}>5 jam yang lalu</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  stockItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  stockDetail: {
    fontSize: 14,
  },
  stockValue: {
    fontWeight: "700",
  },
  alertBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 16,
    marginBottom: 4,
  },
  activityTime: {
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