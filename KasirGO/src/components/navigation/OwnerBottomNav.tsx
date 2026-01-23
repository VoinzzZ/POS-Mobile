import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { LayoutDashboard, History, TrendingUp, Package, Store, Activity } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

export default function OwnerBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();

  const tabs = [
    {
      icon: LayoutDashboard,
      route: "/(owner)/dashboard",
      path: "/dashboard",
    },
    {
      icon: TrendingUp,
      route: "/(owner)/analytics",
      path: "/analytics",
    },
    {
      icon: Activity,
      route: "/(owner)/trafik",
      path: "/trafik",
    },
    {
      icon: Store,
      route: "/(owner)/store",
      path: "/store",
    },
  ];

  const isActive = (path: string) => pathname.includes(path);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <TouchableOpacity
            key={index}
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