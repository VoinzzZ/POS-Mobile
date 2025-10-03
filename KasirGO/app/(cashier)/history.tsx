import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { History, Settings } from "lucide-react-native";
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Riwayat Transaksi</Text>
        <TouchableOpacity 
          onPress={() => router.push("/(cashier)/settings")} 
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyState}>
          <History size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Belum ada transaksi</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Riwayat transaksi akan muncul di sini</Text>
        </View>
      </ScrollView>

      <CashierBottomNav />
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
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  settingsBtn: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
