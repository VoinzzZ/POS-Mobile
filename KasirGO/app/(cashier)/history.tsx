import React, { useState, useEffect, useCallback } from "react";
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
import { History, Settings, Receipt, ChevronRight, Trash2 } from "lucide-react-native";
import CashierBottomNav from "../../src/components/navigation/CashierBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter, useFocusEffect } from "expo-router";
import { transactionService, Transaction } from "../../src/api/transaction";
import TransactionEditModal from "../../src/components/modals/TransactionEditModal";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

  // Auto-refresh when screen comes into focus (e.g., after returning from edit screen)
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 History screen focused - Refreshing transactions...');
      fetchTransactions();
    }, [])
  );

  const fetchTransactions = async () => {
    try {
      // Fetch only today's transactions with COMPLETED status (belum LOCKED)
      const today = new Date();
      const startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
      
      const response = await transactionService.getAllTransactions({
        startDate,
        endDate,
        status: 'COMPLETED', // Hanya tampilkan yang sudah complete tapi belum locked
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

  const handleDeleteTransaction = async (transactionId: number) => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini? Stok produk akan dikembalikan.',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await transactionService.deleteTransaction(transactionId);
              if (response.success) {
                Alert.alert('Berhasil', 'Transaksi berhasil dihapus');
                fetchTransactions(); // Reload list
              }
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Gagal menghapus transaksi');
            }
          },
        },
      ]
    );
  };

  const handleTransactionPress = (transaction: Transaction) => {
    // Open modal instead of navigating
    setSelectedTransactionId(transaction.id);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedTransactionId(null);
  };

  const handleEditModalSaved = () => {
    // Refresh transactions after successful edit
    fetchTransactions();
  };

  const renderTransactionItem = (transaction: Transaction) => (
    <View
      key={transaction.id}
      style={[styles.transactionCard, { backgroundColor: colors.surface }]}
    >
      <TouchableOpacity onPress={() => handleTransactionPress(transaction)}>
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
      </TouchableOpacity>

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

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
          onPress={() => router.push(`/(cashier)/receipt/${transaction.id}`)}
        >
          <Receipt size={16} color={colors.primary} />
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>Cetak Struk</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef444415' }]}
          onPress={() => handleDeleteTransaction(transaction.id)}
        >
          <Trash2 size={16} color="#ef4444" />
          <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
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
      
      {/* Transaction Edit Modal */}
      <TransactionEditModal
        visible={editModalVisible}
        transactionId={selectedTransactionId}
        onClose={handleEditModalClose}
        onSaved={handleEditModalSaved}
      />
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
