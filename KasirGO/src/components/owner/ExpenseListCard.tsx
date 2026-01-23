import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, FlatList } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Plus, Wallet, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react-native";
import { getAllCashTransactions, CashTransaction } from "../../api/cashTransaction";

interface ExpenseListCardProps {
    onAddExpense: () => void;
}

export default function ExpenseListCard({ onAddExpense }: ExpenseListCardProps) {
    const { colors } = useTheme();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [expenses, setExpenses] = useState<CashTransaction[]>([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const isCurrentMonth = () => {
        const now = new Date();
        return selectedDate.getMonth() === now.getMonth() &&
            selectedDate.getFullYear() === now.getFullYear();
    };

    const getMonthDateRange = (date: Date) => {
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        return {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
        };
    };

    const loadExpenseData = async () => {
        try {
            const dateRange = getMonthDateRange(selectedDate);

            const expensesRes = await getAllCashTransactions(
                'EXPENSE',
                undefined,
                undefined,
                dateRange.start_date,
                dateRange.end_date
            );

            if (expensesRes.success && expensesRes.data) {
                const filteredExpenses = expensesRes.data.filter(expense => {
                    const categoryCode = expense.t_expense_category?.category_code;
                    const categoryType = expense.category_type;

                    if (categoryCode === 'PURCHASE_INVENTORY' || categoryCode === 'RETURN_REFUND') {
                        return false;
                    }
                    if (categoryType === 'PURCHASE' || categoryType === 'RETURN') {
                        return false;
                    }
                    return true;
                });

                setExpenses(filteredExpenses);

                const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
                setTotalExpense(total);
            }
        } catch (error) {
            console.error("Error loading expense data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        loadExpenseData();
    }, [selectedDate]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadExpenseData();
        setRefreshing(false);
    }, [selectedDate]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatMonthYear = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric'
        });
    };

    const goToPreviousMonth = () => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        const now = new Date();
        const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);

        if (nextMonth <= now) {
            setSelectedDate(nextMonth);
        }
    };

    const canGoNext = () => {
        const now = new Date();
        const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
        return nextMonth <= now;
    };

    const renderExpenseItem = ({ item }: { item: CashTransaction }) => (
        <View style={[styles.expenseItem, { backgroundColor: colors.card }]}>
            <View style={styles.expenseInfo}>
                <Text style={[styles.expenseDescription, { color: colors.text }]}>
                    {item.description || 'Pengeluaran'}
                </Text>
                {item.t_expense_category && (
                    <Text style={[styles.expenseCategory, { color: colors.textSecondary }]}>
                        {item.t_expense_category.category_name}
                    </Text>
                )}
                <View style={styles.expenseMeta}>
                    <Text style={[styles.expenseDate, { color: colors.textSecondary }]}>
                        {formatDate(item.transaction_date)}
                    </Text>
                </View>
            </View>
            <Text style={[styles.expenseAmount, { color: '#ef4444' }]}>
                {formatCurrency(item.amount)}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Pengeluaran</Text>
                {isCurrentMonth() && (
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={onAddExpense}
                    >
                        <Plus size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.monthSelector, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    style={styles.monthButton}
                    onPress={goToPreviousMonth}
                >
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>

                <Text style={[styles.monthText, { color: colors.text }]}>
                    {formatMonthYear(selectedDate)}
                </Text>

                <TouchableOpacity
                    style={styles.monthButton}
                    onPress={goToNextMonth}
                    disabled={!canGoNext()}
                >
                    <ChevronRight
                        size={24}
                        color={canGoNext() ? colors.text : colors.textSecondary + '40'}
                    />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Memuat data...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.summaryIcon, { backgroundColor: '#ef4444' + '20' }]}>
                            <TrendingDown size={24} color="#ef4444" />
                        </View>
                        <View style={styles.summaryInfo}>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                                Total Pengeluaran
                            </Text>
                            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
                                {formatCurrency(totalExpense)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.expensesList}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Riwayat Transaksi
                        </Text>
                        {expenses.length === 0 ? (
                            <View style={[styles.emptyContainer, { backgroundColor: colors.card }]}>
                                <Text style={[styles.emptyText, { color: colors.text }]}>
                                    Belum ada pengeluaran
                                </Text>
                                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                    {isCurrentMonth()
                                        ? 'Tambahkan pengeluaran baru untuk mulai'
                                        : 'Tidak ada transaksi di bulan ini'}
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={expenses}
                                keyExtractor={(item) => item.cash_transaction_id.toString()}
                                renderItem={renderExpenseItem}
                                scrollEnabled={false}
                            />
                        )}
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    monthButton: {
        padding: 8,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'capitalize',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 12,
    },
    summaryCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    summaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    summaryInfo: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 13,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    expensesList: {
        marginBottom: 16,
    },
    expenseItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    expenseInfo: {
        flex: 1,
    },
    expenseDescription: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    expenseCategory: {
        fontSize: 12,
        marginBottom: 6,
    },
    expenseMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    expenseDate: {
        fontSize: 11,
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
});
