import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    FlatList,
} from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { Search, Filter, X, Settings, Activity as ActivityIcon } from "lucide-react-native";
import OwnerBottomNav from "../../src/components/navigation/OwnerBottomNav";
import { useTheme } from "../../src/context/ThemeContext";
import { useRouter } from "expo-router";
import { getAllCashTransactions, CashTransaction } from "../../src/api/cashTransaction";
import TransactionTrafficCard from "../../src/components/owner/TransactionTrafficCard";
import TrafficFilters from "../../src/components/owner/TrafficFilters";

export default function TrafikScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated && !user) {
            router.replace('/auth/login');
        }
    }, [isAuthenticated, user]);

    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<CashTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const getDateRange = (period: string | null) => {
        if (!period) return { start_date: undefined, end_date: undefined };

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 30);
                break;
            case 'year':
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return { start_date: undefined, end_date: undefined };
        }

        return {
            start_date: startDate.toISOString(),
            end_date: now.toISOString()
        };
    };

    const loadTransactions = async (page = 1, refresh = false, loadMore = false) => {
        try {
            if (refresh) {
                setRefreshing(true);
            } else if (loadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const filters: any = {
                page,
                limit: 10,
            };

            if (selectedType) filters.transaction_type = selectedType;
            if (selectedPaymentMethod) filters.payment_method = selectedPaymentMethod;
            if (selectedCategory) filters.category_id = selectedCategory;

            const dateRange = getDateRange(selectedPeriod);
            const response = await getAllCashTransactions(
                filters.transaction_type,
                filters.payment_method,
                filters.category_id,
                dateRange.start_date,
                dateRange.end_date,
                undefined,
                filters.page,
                filters.limit
            );

            if (response.success && response.data) {
                if (loadMore && response.data) {
                    setTransactions(prev => {
                        const existingIds = new Set(prev.map(t => t.cash_transaction_id));
                        const newTransactions = response.data!.filter(
                            t => !existingIds.has(t.cash_transaction_id)
                        );
                        return [...prev, ...newTransactions];
                    });
                } else {
                    setTransactions(response.data);
                }

                if (response.pagination) {
                    setCurrentPage(response.pagination.currentPage);
                    setTotalPages(response.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        loadTransactions(1);
    }, [selectedType, selectedPaymentMethod, selectedCategory, selectedPeriod]);

    const onRefresh = useCallback(async () => {
        setCurrentPage(1);
        await loadTransactions(1, true);
    }, [selectedType, selectedPaymentMethod, selectedCategory, selectedPeriod]);

    const handleLoadMore = () => {
        if (!loadingMore && currentPage < totalPages) {
            const nextPage = currentPage + 1;
            loadTransactions(nextPage, false, true);
        }
    };

    const handleResetFilters = () => {
        setSelectedType(null);
        setSelectedPaymentMethod(null);
        setSelectedCategory(null);
        setSelectedPeriod(null);
    };

    const filteredTransactions = transactions.filter((transaction) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            transaction.transaction_number?.toLowerCase().includes(query) ||
            transaction.description?.toLowerCase().includes(query) ||
            transaction.notes?.toLowerCase().includes(query) ||
            transaction.t_expense_category?.category_name?.toLowerCase().includes(query)
        );
    });

    const hasActiveFilters =
        selectedType !== null ||
        selectedPaymentMethod !== null ||
        selectedCategory !== null ||
        selectedPeriod !== null;

    const getFilterLabel = (type: string, value: any): string => {
        if (type === "transaction_type") {
            return value === "INCOME" ? "Pemasukan" : "Pengeluaran";
        }
        if (type === "payment_method") {
            if (value === "CASH") return "Tunai";
            if (value === "QRIS") return "QRIS";
            if (value === "DEBIT") return "Debit";
        }
        return String(value);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Trafik Keuangan
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Tracking semua transaksi pemasukan & pengeluaran
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push("/(owner)/settings")}
                    style={styles.settingsBtn}
                >
                    <Settings size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.trafficContainer}>
                <View style={styles.trafficHeader}>
                    <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                        <Search size={18} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Cari transaksi..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <X size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            {
                                backgroundColor: hasActiveFilters ? colors.primary : colors.card,
                            },
                        ]}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Filter size={20} color={hasActiveFilters ? "#fff" : colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {hasActiveFilters && (
                    <View style={styles.activeFilters}>
                        {selectedType && (
                            <View style={[styles.filterChip, { backgroundColor: colors.primary + "20" }]}>
                                <Text style={[styles.filterChipText, { color: colors.primary }]}>
                                    {getFilterLabel("transaction_type", selectedType)}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedType(null)}>
                                    <X size={14} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                        {selectedPaymentMethod && (
                            <View style={[styles.filterChip, { backgroundColor: colors.primary + "20" }]}>
                                <Text style={[styles.filterChipText, { color: colors.primary }]}>
                                    {getFilterLabel("payment_method", selectedPaymentMethod)}
                                </Text>
                                <TouchableOpacity onPress={() => setSelectedPaymentMethod(null)}>
                                    <X size={14} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                            Memuat transaksi...
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredTransactions}
                        renderItem={({ item }) => <TransactionTrafficCard transaction={item} />}
                        keyExtractor={(item) => item.cash_transaction_id.toString()}
                        contentContainerStyle={styles.transactionsList}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={() => {
                            if (loadingMore) {
                                return (
                                    <View style={styles.footerLoader}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                            Memuat lebih banyak...
                                        </Text>
                                    </View>
                                );
                            }
                            return null;
                        }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <ActivityIcon size={48} color={colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: colors.text }]}>
                                    {searchQuery ? "Tidak ada hasil" : "Belum ada transaksi"}
                                </Text>
                                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                    {searchQuery
                                        ? "Coba kata kunci lain"
                                        : "Transaksi akan muncul di sini"}
                                </Text>
                            </View>
                        )}
                    />
                )}

                <TrafficFilters
                    visible={filterModalVisible}
                    onClose={() => setFilterModalVisible(false)}
                    selectedType={selectedType}
                    selectedPaymentMethod={selectedPaymentMethod}
                    selectedCategory={selectedCategory}
                    selectedPeriod={selectedPeriod}
                    onTypeChange={setSelectedType}
                    onPaymentMethodChange={setSelectedPaymentMethod}
                    onCategoryChange={setSelectedCategory}
                    onPeriodChange={setSelectedPeriod}
                    onReset={handleResetFilters}
                />
            </View>

            <OwnerBottomNav />
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
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    settingsBtn: {
        padding: 8,
    },
    trafficContainer: {
        flex: 1,
    },
    trafficHeader: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    activeFilters: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 8,
        flexWrap: "wrap",
    },
    filterChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 100,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 12,
    },
    transactionsList: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 4,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 12,
    },
});
