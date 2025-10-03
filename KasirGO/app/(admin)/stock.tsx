import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Package, Plus, Settings } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";

export default function StockScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Manajemen Stok</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]}>
            <Plus size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push("/(admin)/settings")} 
            style={styles.settingsBtn}
          >
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyState}>
          <Package size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Belum ada produk</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tambahkan produk pertama untuk memulai</Text>
        </View>
      </ScrollView>

      <AdminBottomNav />
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
  headerActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
