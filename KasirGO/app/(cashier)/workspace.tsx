import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";

export default function WorkspaceScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workspace</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.emptyState}>
          <ShoppingCart size={48} color="#475569" />
          <Text style={styles.emptyText}>Start Transaction</Text>
          <Text style={styles.emptySubtext}>Scan products or add them manually</Text>
        </View>
      </ScrollView>

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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#1e293b",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
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
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#475569",
    marginTop: 8,
  },
});
