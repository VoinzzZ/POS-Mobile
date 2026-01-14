import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { DollarSign, TrendingUp, Briefcase, Wallet } from "lucide-react-native";
import { getFinancialSummary, FinancialSummary } from "../../api/financial";
import { formatCurrency, formatPercentage } from "../../utils/financial.helpers";
import { useTheme } from "../../context/ThemeContext";

export default function FinancialOverview() {
    const { colors } = useTheme();
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFinancialSummary();
    }, []);

    const fetchFinancialSummary = async () => {
        try {
            setLoading(true);
            const response = await getFinancialSummary();
            if (response.success && response.data) {
                setSummary(response.data);
            }
        } catch (err: any) {
            setError(err.message || "Gagal memuat data keuangan");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !summary) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                    {error || "Data tidak tersedia"}
                </Text>
            </View>
        );
    }

    const stats = [
        {
            title: "Total Pendapatan",
            value: formatCurrency(summary.revenue.total),
            icon: DollarSign,
            color: "#10b981",
            bgColor: "#064e3b",
        },
        {
            title: "Margin Laba",
            value: formatPercentage(summary.revenue.profitMargin),
            icon: TrendingUp,
            color: "#3b82f6",
            bgColor: "#1e3a8a",
        },
        {
            title: "Total Transaksi",
            value: summary.transactions.total.toLocaleString(),
            icon: Briefcase,
            color: "#f59e0b",
            bgColor: "#78350f",
        },
        {
            title: "Uang di Kasir",
            value: formatCurrency(summary.cashDrawer.totalCashInOpenDrawers),
            icon: Wallet,
            color: "#ec4899",
            bgColor: "#831843",
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                                <Icon size={24} color={stat.color} />
                            </View>
                            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                            <Text style={[styles.statTitle, { color: colors.textSecondary }]}>
                                {stat.title}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {summary.expenses && (
                <View style={[styles.profitCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.profitTitle, { color: colors.text }]}>
                        Laba Bersih (Net Profit)
                    </Text>
                    <Text style={[styles.profitValue, { color: colors.success }]}>
                        {formatCurrency(summary.expenses.netProfit)}
                    </Text>
                    <Text style={[styles.profitSubtext, { color: colors.textSecondary }]}>
                        Setelah pengeluaran operasional
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    centerContent: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    errorText: {
        fontSize: 14,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    statCard: {
        width: "48%",
        padding: 16,
        borderRadius: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
    },
    profitCard: {
        marginTop: 12,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    profitTitle: {
        fontSize: 14,
        marginBottom: 8,
    },
    profitValue: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 4,
    },
    profitSubtext: {
        fontSize: 12,
    },
});
