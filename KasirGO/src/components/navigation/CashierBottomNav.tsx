import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { LayoutDashboard, ShoppingCart, History, Package } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useOrientation } from "../../hooks/useOrientation";

export default function CashierBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isLandscape: isLand, isTablet: isTab } = useOrientation();

  const tabs = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      route: "/(cashier)/dashboard",
      path: "/dashboard",
    },
    {
      name: "Transaksi",
      icon: ShoppingCart,
      route: "/(cashier)/workspace",
      path: "/workspace",
    },
    {
      name: "Riwayat",
      icon: History,
      route: "/(cashier)/history",
      path: "/history",
    },
    {
      name: "Stok",
      icon: Package,
      route: "/(cashier)/stock",
      path: "/stock",
    },
  ];

  const isActive = (path: string) => pathname.includes(path);

  return (
    <View style={[styles.container, isLand && isTab ? styles.landscapeContainer : {}, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tab, isLand && isTab ? styles.landscapeTab : {}]}
            onPress={() => router.push(tab.route as any)}
          >
            <Icon
              size={isLand && isTab ? 28 : 24}
              color={active ? colors.primary : colors.textSecondary}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text style={[styles.label, isLand && isTab ? styles.landscapeLabel : {}, active && styles.labelActive, { color: active ? colors.primary : colors.textSecondary }]}>
              {tab.name}
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
  landscapeContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 16,
    width: 80,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  landscapeTab: {
    flex: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginVertical: 4,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
  landscapeLabel: {
    fontSize: 12,
    marginTop: 6,
    textAlign: "center",
  },
  labelActive: {
    fontWeight: "600",
  },
});
