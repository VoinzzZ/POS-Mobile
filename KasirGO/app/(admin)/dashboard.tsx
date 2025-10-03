import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { DollarSign, Package, Users, TrendingUp, LogOut } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useRouter } from "expo-router";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.userName || "Admin"}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#f87171" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
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

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityText}>No recent transactions</Text>
            <Text style={styles.activitySubtext}>Transaction data will appear here</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Package size={20} color="#4ECDC4" />
              <Text style={styles.actionText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Users size={20} color="#4ECDC4" />
              <Text style={styles.actionText}>Add User</Text>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#1e293b",
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
    color: "#ffffff",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#94a3b8",
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
  activityCard: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  activityText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  activitySubtext: {
    fontSize: 12,
    color: "#475569",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
});
