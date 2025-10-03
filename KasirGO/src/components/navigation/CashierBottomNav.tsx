import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { LayoutDashboard, ShoppingCart, History, Settings } from "lucide-react-native";

export default function CashierBottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      route: "/(cashier)/dashboard",
      path: "/dashboard",
    },
    {
      name: "Workspace",
      icon: ShoppingCart,
      route: "/(cashier)/workspace",
      path: "/workspace",
    },
    {
      name: "History",
      icon: History,
      route: "/(cashier)/history",
      path: "/history",
    },
    {
      name: "Settings",
      icon: Settings,
      route: "/(cashier)/settings",
      path: "/settings",
    },
  ];

  const isActive = (path: string) => pathname.includes(path);

  return (
    <View style={styles.container}>
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
              color={active ? "#4ECDC4" : "#64748b"}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text style={[styles.label, active && styles.labelActive]}>
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
    backgroundColor: "#1e293b",
    borderTopWidth: 1,
    borderTopColor: "#334155",
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
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
  },
  labelActive: {
    color: "#4ECDC4",
    fontWeight: "600",
  },
});
