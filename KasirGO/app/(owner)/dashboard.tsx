import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { DollarSign, TrendingUp, Users, Briefcase, Settings, Package, Tag, Folder, Plus } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import RevenueChart from "../../src/components/shared/RevenueChart";
import AddProductModal from "../../src/components/modals/AddProductModal";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";
import { getAllProducts, getAllCategories, getAllBrands } from "../../src/api/product";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  // Product management state
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    loading: true
  });
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Load product statistics
  useEffect(() => {
    loadProductStats();
  }, []);

  const loadProductStats = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
        getAllBrands()
      ]);

      setProductStats({
        totalProducts: productsRes.success && productsRes.data ? productsRes.data.length : 0,
        totalCategories: categoriesRes.success && categoriesRes.data ? categoriesRes.data.length : 0,
        totalBrands: brandsRes.success && brandsRes.data ? brandsRes.data.length : 0,
        loading: false
      });
    } catch (error) {
      console.error("Error loading product stats:", error);
      setProductStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleProductAdded = () => {
    loadProductStats(); // Refresh stats after adding product
  };

  const stats = [
    {
      title: "Total Revenue",
      value: "Rp 24,500,000",
      icon: DollarSign,
      color: "#10b981",
      bgColor: "#064e3b",
    },
    {
      title: "Profit Margin",
      value: "32.5%",
      icon: TrendingUp,
      color: "#3b82f6",
      bgColor: "#1e3a8a",
    },
    {
      title: "Total Transactions",
      value: "3,247",
      icon: Briefcase,
      color: "#f59e0b",
      bgColor: "#78350f",
    },
    {
      title: "Employees",
      value: "12",
      icon: Users,
      color: "#ec4899",
      bgColor: "#831843",
    },
  ];

  const productManagementStats = [
    {
      title: "Products",
      value: productStats.loading ? "..." : productStats.totalProducts.toString(),
      icon: Package,
      color: "#8b5cf6",
      bgColor: "#4c1d95",
    },
    {
      title: "Categories",
      value: productStats.loading ? "..." : productStats.totalCategories.toString(),
      icon: Tag,
      color: "#06b6d4",
      bgColor: "#083344",
    },
    {
      title: "Brands",
      value: productStats.loading ? "..." : productStats.totalBrands.toString(),
      icon: Folder,
      color: "#f97316",
      bgColor: "#7c2d12",
    },
  ];

  const quickActions = [
    {
      title: "Add Product",
      icon: Plus,
      onPress: () => setShowAddProductModal(true),
    },
    {
      title: "Manage Products",
      icon: Package,
      route: "/(owner)/products",
    },
    {
      title: "View Analytics",
      icon: TrendingUp,
      route: "/(owner)/analytics",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome Back,</Text>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || user?.user_name || "Owner"}</Text>
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

        {/* Business Insights */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Insights</Text>
          <View style={[styles.insightsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>Monthly Growth</Text>
            <Text style={[styles.insightValue, { color: colors.primary }]}>+18.5%</Text>
            <Text style={[styles.insightSubtext, { color: colors.textSecondary }]}>Compared to last month</Text>
          </View>
        </View>

        {/* Product Management Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Management</Text>
          <View style={styles.productStatsGrid}>
            {productManagementStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.productStatCard, { borderLeftColor: stat.color, backgroundColor: colors.card }]}
                  onPress={() => {
                    if (stat.title === "Products") {
                      router.push("/(owner)/products?tab=products");
                    } else if (stat.title === "Categories") {
                      router.push("/(owner)/products?tab=categories");
                    } else if (stat.title === "Brands") {
                      router.push("/(owner)/products?tab=brands");
                    }
                  }}
                >
                  <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                    {productStats.loading ? (
                      <ActivityIndicator size="small" color={stat.color} />
                    ) : (
                      <Icon size={24} color={stat.color} />
                    )}
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionButton, { backgroundColor: colors.card }]}
                  onPress={() => {
                    if (action.onPress) {
                      action.onPress();
                    } else if (action.route) {
                      router.push(action.route as any);
                    }
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

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={() => {
          setShowAddProductModal(false);
          handleProductAdded();
          Alert.alert("Success", "Product added successfully!");
        }}
      />

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
  productStatsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  productStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    alignItems: "center",
  },
});