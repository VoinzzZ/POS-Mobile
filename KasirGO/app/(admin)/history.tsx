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
import { History, Settings, Receipt, ChevronRight, Trash2, Edit, Filter, ChevronLeft } from "lucide-react-native";
import AdminBottomNav from "../../src/components/navigation/AdminBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter, useFocusEffect } from "expo-router";
import { transactionService, Transaction } from "../../src/api/transaction";
import TransactionFilterModal from "../../src/components/modals/TransactionFilterModal";

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [stats, setStats] = useState({
    totalAmount: 0,
    completedCount: 0,
    lockedCount: 0,
  });

  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Admin History screen focused - Refreshing transactions...');
      fetchTransactions();
    }, [filters, currentPage])
  );

  const fetchTransactions = async () => {
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
        ...filters,
      };

      const response = await transactionService.getAllTransactions(params);
      console.log('📦 Transaction Response:', JSON.stringify(response, null, 2));
      if (response.success) {
        const transactionsData = Array.isArray(response.data)
          ? response.data
          : (response.data?.data || []);
        const pagination = response.data?.pagination;

        console.log('✅ Transactions loaded:', transactionsData.length);
        setTransactions(transactionsData);

        if (pagination) {
          setTotalPages(pagination.totalPages || 1);
          setTotalTransactions(pagination.total || 0);
        }

        calculateStats(transactionsData);
      }
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
      Alert.alert('Error', 'Gagal memuat riwayat transaksi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (data: Transaction[]) => {
    const totalAmount = data.reduce((sum, t) => sum + t.total, 0);
    const completedCount = data.filter(t => t.status === 'COMPLETED').length;
    const lockedCount = data.filter(t => t.status === 'LOCKED').length;

    setStats({ totalAmount, completedCount, lockedCount });
  };

  const handleApplyFilter = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
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

  const handleDeleteTransaction = async (transactionId: number, transactionStatus: string) => {
    const statusText = transactionStatus === 'LOCKED' ? 'terkunci' : transactionStatus === 'COMPLETED' ? 'selesai' : 'draft';
    Alert.alert(
      'Hapus Transaksi',
      `Apakah Anda yakin ingin menghapus transaksi ${statusText} ini? Stok produk akan dikembalikan.`,
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
    const cashierInfo = transaction.cashier ? `\nKasir: ${transaction.cashier.userName}` : '';
    const items = transaction.items?.map(item =>
      `${item.product.name} (${item.quantity}x) - ${formatCurrency(item.subtotal)}`
    ).join('\n') || '';

    // Admin dapat melakukan berbagai aksi pada transaksi
    const actions: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[] = [
        {
          text: 'Tutup',
          style: 'cancel' as const,
        },
      ];

    // Tambah opsi cetak struk untuk transaksi COMPLETED/LOCKED
    if (transaction.status === 'COMPLETED' || transaction.status === 'LOCKED') {
      actions.push({
        text: 'Cetak Struk',
        onPress: () => router.push(`/(admin)/receipt/${transaction.id}` as any),
      });
    }

    // Admin bisa edit semua transaksi, termasuk yang LOCKED
    actions.push({
      text: 'Edit Transaksi',
      onPress: () => router.push(`/(admin)/edit-transaction/${transaction.id}` as any),
    });

    // Tambah opsi delete (admin bisa delete semua)
    actions.push({
      text: 'Hapus Transaksi',
      onPress: () => handleDeleteTransaction(transaction.id, transaction.status),
    });

    Alert.alert(
      `Detail Transaksi #${transaction.id}`,
      `Status: ${getStatusText(transaction.status)}${cashierInfo}\nTotal: ${formatCurrency(transaction.total)}\n\nProduk:\n${items}`,
      actions
    );
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
            {transaction.cashier && (
              <Text style={[styles.cashierName, { color: colors.textSecondary }]}>
                Kasir: {transaction.cashier.userName}
              </Text>
            )}
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

      {/* Admin action buttons - same as cashier but for all transactions */}
      <View style={styles.actionButtons}>
        {/* Cetak Struk - hanya untuk COMPLETED/LOCKED */}
        {(transaction.status === 'COMPLETED' || transaction.status === 'LOCKED') && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
            onPress={() => router.push(`/(admin)/receipt/${transaction.id}` as any)}
          >
            <Receipt size={16} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Cetak</Text>
          </TouchableOpacity>
        )}

        {/* Edit Transaksi - Admin bisa edit semua, termasuk LOCKED */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10b98115' }]}
          onPress={() => router.push(`/(admin)/edit-transaction/${transaction.id}` as any)}
        >
          <Edit size={16} color="#10b981" />
          <Text style={[styles.actionButtonText, { color: '#10b981' }]}>Edit</Text>
        </TouchableOpacity>

        {/* Hapus Transaksi - admin bisa hapus semua */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef444415' }]}
          onPress={() => handleDeleteTransaction(transaction.id, transaction.status)}
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
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Riwayat Transaksi</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Kelola dan pantau transaksi
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={[styles.filterBtn, { backgroundColor: colors.card }]}
          >
            <Filter size={20} color={Object.keys(filters).length > 0 ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/settings')}
            style={styles.settingsBtn}
          >
            <Settings size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Summary */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{formatCurrency(stats.totalAmount)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
        </View>
        <View style={{ gap: 8, flex: 1 }}>
          <View style={[styles.miniStatCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.miniStatValue, { color: '#10b981' }]}>{stats.completedCount}</Text>
            <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Selesai</Text>
          </View>
          <View style={[styles.miniStatCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.miniStatValue, { color: '#6b7280' }]}>{stats.lockedCount}</Text>
            <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Terkunci</Text>
          </View>
        </View>
      </View>

      {/* Filter Info Bar */}
      {Object.keys(filters).length > 0 && (
        <View style={[styles.filterInfoBar, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.filterInfoText, { color: colors.primary }]}>
            Filter aktif: {Object.keys(filters).length} kriteria
          </Text>
          <TouchableOpacity onPress={handleClearFilter}>
            <Text style={[styles.clearFilterText, { color: colors.primary }]}>Hapus Filter</Text>
          </TouchableOpacity>
        </View>
      )}

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
              Coba ubah filter atau tarik ke bawah untuk refresh
            </Text>
          </View>
        </ScrollView>
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {transactions.map(renderTransactionItem)}
          </ScrollView>

          {/* Pagination Controls */}
          <View style={[styles.paginationContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} color={currentPage === 1 ? colors.textSecondary : colors.text} />
            </TouchableOpacity>

            <Text style={[styles.pageInfo, { color: colors.text }]}>
              Halaman {currentPage} dari {totalPages}
            </Text>

            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              onPress={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} color={currentPage === totalPages ? colors.textSecondary : colors.text} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <AdminBottomNav />

      <TransactionFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilter}
        currentFilters={filters}
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
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  filterBtn: {
    padding: 8,
    borderRadius: 8,
  },
  settingsBtn: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1.5,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  miniStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  miniStatLabel: {
    fontSize: 12,
  },
  filterInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  filterInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '700',
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
  cashierName: {
    fontSize: 11,
    marginTop: 2,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  pageButton: {
    padding: 8,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
});
