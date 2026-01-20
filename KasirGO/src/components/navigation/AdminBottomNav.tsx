import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { LayoutDashboard, Package, Warehouse, Store, ShoppingCart } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

export default function AdminBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();

  const tabs = [
    {
      icon: LayoutDashboard,
      route: "/(admin)/dashboard",
      path: "/dashboard",
    },
    {
      icon: Package,
      route: "/(admin)/products",
      path: "/products",
    },
    {
      icon: ShoppingCart,
      route: "/(admin)/manual-purchases",
      path: "/manual-purchases",
    },
    {
      icon: Warehouse,
      route: "/(admin)/stock",
      path: "/stock",
    },
  ];

  const isActive = (path: string) => pathname.includes(path);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
          >
            {active && (
              <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
            )}
            <Icon
              size={24}
              color={active ? colors.primary : colors.textSecondary}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text style={[styles.label, active && styles.labelActive, { color: active ? colors.primary : colors.textSecondary }]}>
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
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
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  labelActive: {
    fontWeight: "600",
  },
});
