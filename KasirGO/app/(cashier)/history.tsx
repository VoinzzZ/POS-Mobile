import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { History, Settings, Receipt, ChevronRight } from "lucide-react-native";
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import { transactionService, Transaction } from "../../src/api/transaction";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getAllTransactions({
        page: 1,
        limit: 50,
      });
      console.log('📦 Transaction Response:', JSON.stringify(response, null, 2));
      if (response.success) {
        // Check if data is array directly or nested in data.data
        const transactionsData = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.data || []);
        console.log('✅ Transactions loaded:', transactionsData.length);
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      Alert.alert('Error', 'Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '#10b981';
      case 'DRAFT':
        return '#f59e0b';
      case 'LOCKED':
        return '#6b7280';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Selesai';
      case 'DRAFT':
        return 'Draft';
      case 'LOCKED':
        return 'Terkunci';
      default:
        return status;
    }
  };

  const handleTransactionPress = (transaction: Transaction) => {
    if (transaction.status === 'DRAFT') {
      router.push(`/(cashier)/transaction/${transaction.id}`);
    } else {
      // TODO: Navigate to transaction detail view
      Alert.alert(
        'Detail Transaksi',
        `Transaksi #${transaction.id}\nTotal: ${formatCurrency(transaction.total)}\nStatus: ${getStatusText(transaction.status)}`,
        [
          {
            text: 'Tutup',
            style: 'cancel',
          },
          transaction.status === 'COMPLETED' && {
            text: 'Cetak Struk',
            onPress: () => router.push(`/(cashier)/transaction/${transaction.id}`),
          },
        ].filter(Boolean)
      );
    }
  };

  const renderTransactionItem = (transaction: Transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={[styles.transactionCard, { backgroundColor: colors.surface }]}
      onPress={() => handleTransactionPress(transaction)}
    >
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIconContainer}>
          <Receipt size={20} color={colors.primary} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionId, { color: colors.text }]}>
            Transaksi #{transaction.id}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {formatDate(transaction.createdAt)}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.transactionRow}>
          <Text style={[styles.transactionLabel, { color: colors.textSecondary }]}>
            Total Item:
          </Text>
          <Text style={[styles.transactionValue, { color: colors.text }]}>
            {(transaction.items && Array.isArray(transaction.items) ? transaction.items.length : 0)} item
          </Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={[styles.transactionLabel, { color: colors.textSecondary }]}>
            Total:
          </Text>
          <Text style={[styles.transactionTotal, { color: colors.primary }]}>
            {formatCurrency(transaction.total)}
          </Text>
        </View>
        <View style={styles.transactionRow}>
          <Text style={[styles.transactionLabel, { color: colors.textSecondary }]}>
            Status:
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(transaction.status)}20` },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
              {getStatusText(transaction.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Riwayat Transaksi</Text>
        <TouchableOpacity
          onPress={() => router.push('/(cashier)/settings')}
          style={styles.settingsBtn}
        >
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Memuat riwayat...
          </Text>
        </View>
      ) : transactions.length === 0 ? (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyState}>
            <History size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.text }]}>
              Belum ada transaksi
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Riwayat transaksi akan muncul di sini
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {transactions.map(renderTransactionItem)}
        </ScrollView>
      )}

      <CashierBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  settingsBtn: {
    padding: 8,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f620',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionDetails: {
    gap: 8,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: 14,
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
