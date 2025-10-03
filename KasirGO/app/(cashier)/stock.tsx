import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { Package, Settings, LogOut, Search, AlertCircle } from "lucide-react-native";
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";
import { useRouter } from "expo-router";

export default function CashierStock() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  // Dummy data untuk stock list
  const [products] = useState([
    {
      id: 1,
      name: "Coca Cola 330ml",
      category: "Beverages",
      stock: 45,
      price: 5000,
      lowStock: false,
    },
    {
      id: 2,
      name: "Indomie Goreng",
      category: "Food",
      stock: 120,
      price: 3500,
      lowStock: false,
    },
    {
      id: 3,
      name: "Tissue Nice",
      category: "Household",
      stock: 8,
      price: 12000,
      lowStock: true,
    },
    {
      id: 4,
      name: "Air Mineral 600ml",
      category: "Beverages",
      stock: 5,
      price: 3000,
      lowStock: true,
    },
  ]);

  const lowStockProducts = products.filter(p => p.lowStock);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Beverages: "#3b82f6",
      Food: "#f59e0b",
      Household: "#ec4899",
    };
    return colors[category] || "#64748b";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Stock Overview</Text>
          <Text style={styles.headerSubtitle}>View product availability</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => router.push("/(cashier)/settings")} 
            style={styles.settingsBtn}
          >
            <Settings size={20} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <View style={styles.alertCard}>
            <AlertCircle size={20} color="#f59e0b" />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Low Stock Alert</Text>
              <Text style={styles.alertText}>
                {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low
              </Text>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#64748b" />
          <Text style={styles.searchPlaceholder}>Search products...</Text>
        </View>

        {/* Products List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Products ({products.length})</Text>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={[styles.productIcon, { backgroundColor: getCategoryColor(product.category) + "20" }]}>
                <Package size={24} color={getCategoryColor(product.category)} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>Rp {product.price.toLocaleString("id-ID")}</Text>
              </View>
              <View style={styles.stockInfo}>
                <Text style={[
                  styles.stockValue,
                  product.lowStock && styles.stockLow
                ]}>
                  {product.stock}
                </Text>
                <Text style={styles.stockLabel}>units</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  settingsBtn: {
    padding: 8,
  },
  logoutBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#78350f",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fbbf24",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 12,
    color: "#fde68a",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
    marginBottom: 12,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  stockInfo: {
    alignItems: "center",
  },
  stockValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#10b981",
  },
  stockLow: {
    color: "#f59e0b",
  },
  stockLabel: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
});
