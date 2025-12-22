import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal, Alert } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { LayoutDashboard, History, TrendingUp, Package, Store, Plus, X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import AddProductModal from "../modals/AddProductModal";

export default function OwnerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const handleProductAdded = () => {
    setShowAddProductModal(false);
    Alert.alert("Success", "Product added successfully!");
    // Optionally refresh the current page if it's the products page
    if (pathname.includes("/products")) {
      router.replace("/(owner)/products");
    }
  };

  const tabs = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      route: "/(owner)/dashboard",
      path: "/dashboard",
    },
    {
      name: "Products",
      icon: Package,
      route: "/(owner)/products",
      path: "/products",
    },
    {
      name: "Analytics",
      icon: TrendingUp,
      route: "/(owner)/analytics",
      path: "/analytics",
    },
    {
      name: "Store",
      icon: Store,
      route: "/(owner)/store",
      path: "/store",
    },
  ];

  const isActive = (path: string) => pathname.includes(path);

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowAddProductModal(true)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.route as any)}
            >
              <Icon
                size={24}
                color={active ? colors.primary : colors.textSecondary}
                strokeWidth={active ? 2.5 : 2}
              />
              <Text style={[styles.label, active && styles.labelActive, { color: active ? colors.primary : colors.textSecondary }]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add Product Modal */}
      <AddProductModal
        visible={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSuccess={handleProductAdded}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  labelActive: {
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 80, // Position above the bottom nav
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1000,
  },
});