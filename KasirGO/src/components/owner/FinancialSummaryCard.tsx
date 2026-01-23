import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { BanknoteArrowUp, BanknoteArrowDown, DollarSign, TrendingUp, TrendingDown, ShoppingBag, Wallet, CreditCard, Receipt, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react-native";
import { getFinancialSummary, FinancialSummary } from "../../api/financial";
import { getExpenseByCategory } from "../../api/cashTransaction";
import { formatCurrency, formatPercentage, getDateRange, formatDateRangeLabel, ChangeIndicator, getChangeIndicator } from "../../utils/financial.helpers";
import { useTheme } from "../../context/ThemeContext";

type PeriodType = 'today' | 'week' | 'month' | 'year';

export default function FinancialSummaryCard() {
    const { colors } = useTheme();
    const [period, setPeriod] = useState<PeriodType>('today');
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [expenseByCategory, setExpenseByCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFinancialData();
    }, [period]);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);
            setError(null);
            const dateRange = getDateRange(period);
            const [summaryRes, expenseCategoryRes] = await Promise.all([
                getFinancialSummary(dateRange),
                getExpenseByCategory(dateRange.start_date, dateRange.end_date)
            ]);
            if (summaryRes.success && summaryRes.data) {
                setSummary(summaryRes.data);
            } else {
                setError("Gagal memuat data keuangan");
            }
            if (expenseCategoryRes.success && expenseCategoryRes.data) {
                const filteredCategories = expenseCategoryRes.data.categories.filter(cat =>
                    cat.category_code !== 'PURCHASE_INVENTORY' && cat.category_code !== 'RETURN_REFUND'
                );
                const filteredTotal = filteredCategories.reduce((sum, cat) => sum + cat.total_amount, 0);
                setExpenseByCategory({
                    total_expense: filteredTotal,
                    categories: filteredCategories
                });
            }
        } catch (err: any) {
            setError(err.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const periods: { label: string; value: PeriodType }[] = [
        { label: 'Hari Ini', value: 'today' },
        { label: 'Minggu Ini', value: 'week' },
        { label: 'Bulan Ini', value: 'month' },
        { label: 'Tahun Ini', value: 'year' },
    ];

    const renderPeriodSelector = () => (
        <View style={[styles.periodSelector, { backgroundColor: colors.background }]}>
            {periods.map((p) => (
                <TouchableOpacity
                    key={p.value}
                    style={[
                        styles.periodButton,
                        period === p.value && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setPeriod(p.value)}
                >
                    <Text style={[
                        styles.periodButtonText,
                        { color: period === p.value ? '#ffffff' : colors.textSecondary }
                    ]}>
                        {p.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderMetricCard = (
        title: string,
        value: string,
        icon: any,
        color: string,
        bgColor: string
    ) => {
        const Icon = icon;
        return (
            <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
                <View style={[styles.metricIconContainer, { backgroundColor: bgColor }]}>
                    <Icon size={18} color={color} />
                </View>
                <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
                <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
            </View>
        );
    };

    const renderPaymentMethodBreakdown = () => {
        if (!summary) return null;

        const paymentMethods = [
            { label: 'Tunai', value: summary.transactions.byPaymentMethod.CASH, color: '#10b981' },
            { label: 'QRIS', value: summary.transactions.byPaymentMethod.QRIS, color: '#3b82f6' },
            { label: 'Debit', value: summary.transactions.byPaymentMethod.DEBIT, color: '#f59e0b' },
        ];

        return (
            <View style={[styles.paymentBreakdown, { backgroundColor: colors.card }]}>
                <Text style={[styles.paymentTitle, { color: colors.text }]}>
                    Pendapatan per Metode Pembayaran
                </Text>
                <View style={styles.paymentMethods}>
                    {paymentMethods.map((method, index) => (
                        <View key={index} style={styles.paymentMethod}>
                            <View style={styles.paymentLabelRow}>
                                <View style={[styles.paymentDot, { backgroundColor: method.color }]} />
                                <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>
                                    {method.label}
                                </Text>
                            </View>
                            <Text style={[styles.paymentValue, { color: colors.text }]}>
                                {formatCurrency(method.value)}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Ringkasan Keuangan</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        Memuat data...
                    </Text>
                </View>

                {renderPeriodSelector()}

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={[styles.profitCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.skeleton, styles.skeletonText, { backgroundColor: colors.border }]} />
                        <View style={[styles.skeleton, styles.skeletonValue, { backgroundColor: colors.border, marginTop: 8 }]} />
                        <View style={[styles.skeleton, styles.skeletonSubtext, { backgroundColor: colors.border, marginTop: 4 }]} />
                    </View>

                    <View style={styles.metricsGrid}>
                        {[1, 2, 3].map((item) => (
                            <View key={item} style={[styles.metricCard, { backgroundColor: colors.card }]}>
                                <View style={[styles.skeleton, styles.skeletonIcon, { backgroundColor: colors.border }]} />
                                <View style={[styles.skeleton, styles.skeletonMetricValue, { backgroundColor: colors.border, marginTop: 12 }]} />
                                <View style={[styles.skeleton, styles.skeletonMetricTitle, { backgroundColor: colors.border, marginTop: 4 }]} />
                            </View>
                        ))}
                    </View>

                    <View style={[styles.paymentBreakdown, { backgroundColor: colors.card }]}>
                        <View style={[styles.skeleton, styles.skeletonText, { backgroundColor: colors.border }]} />
                        <View style={{ marginTop: 16, gap: 12 }}>
                            {[1, 2, 3].map((item) => (
                                <View key={item} style={styles.paymentMethod}>
                                    <View style={[styles.skeleton, styles.skeletonPaymentLabel, { backgroundColor: colors.border }]} />
                                    <View style={[styles.skeleton, styles.skeletonPaymentValue, { backgroundColor: colors.border }]} />
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }

    if (error || !summary) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                    {error || "Data tidak tersedia"}
                </Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    onPress={fetchFinancialData}
                >
                    <Text style={styles.retryButtonText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const averageTransaction = summary.transactions.total > 0
        ? summary.revenue.total / summary.transactions.total
        : 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Ringkasan Keuangan</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    {formatDateRangeLabel(period)}
                </Text>
            </View>

            {renderPeriodSelector()}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.profitCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>
                        Total Pendapatan
                    </Text>
                    <Text style={[styles.profitValue, { color: '#10b981' }]}>
                        {formatCurrency(summary.revenue.total)}
                    </Text>
                </View>

                <View style={styles.metricsGrid}>
                    {renderMetricCard(
                        'Total Transaksi',
                        summary.transactions.total.toLocaleString('id-ID'),
                        ShoppingBag,
                        '#3b82f6',
                        '#1e3a8a'
                    )}
                    {renderMetricCard(
                        'Rata-rata Margin',
                        formatPercentage(summary.revenue.profitMargin),
                        TrendingUp,
                        '#10b981',
                        '#064e3b'
                    )}
                    {renderMetricCard(
                        'Total Pengeluaran',
                        formatCurrency(expenseByCategory?.total_expense || 0),
                        BanknoteArrowDown,
                        '#ef4444',
                        '#7f1d1d'
                    )}
                </View>

                {renderPaymentMethodBreakdown()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    centerContent: {
        paddingVertical: 60,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 8,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    retryButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    header: {
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
    },
    periodSelector: {
        flexDirection: 'row',
        padding: 3,
        borderRadius: 8,
        marginBottom: 16,
        gap: 4,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    periodButtonText: {
        fontSize: 11,
        fontWeight: '600',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    mainMetrics: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        minWidth: '30%',
        padding: 12,
        borderRadius: 10,
    },
    metricIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    metricTitle: {
        fontSize: 10,
        fontWeight: '500',
    },
    metricSubtitle: {
        fontSize: 10,
        marginTop: 2,
    },
    profitSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    profitCard: {
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 12,
    },
    profitLabel: {
        fontSize: 12,
        marginBottom: 6,
    },
    profitValue: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 0,
    },
    profitSubtext: {
        fontSize: 11,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
    },
    paymentBreakdown: {
        padding: 14,
        borderRadius: 10,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    paymentTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
    },
    paymentMethods: {
        gap: 10,
    },
    paymentMethod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    paymentDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    paymentLabel: {
        fontSize: 12,
    },
    paymentValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    skeleton: {
        borderRadius: 4,
        opacity: 0.3,
    },
    skeletonText: {
        width: 100,
        height: 14,
    },
    skeletonValue: {
        width: 150,
        height: 28,
    },
    skeletonSubtext: {
        width: 180,
        height: 12,
    },
    skeletonIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
    },
    skeletonMetricValue: {
        width: 80,
        height: 20,
    },
    skeletonMetricTitle: {
        width: 60,
        height: 12,
    },
    skeletonPaymentLabel: {
        width: 60,
        height: 14,
    },
    skeletonPaymentValue: {
        width: 80,
        height: 16,
    },
});
