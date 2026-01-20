import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CreditCard, Smartphone, Banknote } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface PaymentMethodStatsProps {
    paymentMethodBreakdown: {
        CASH: { total: number; count: number };
        QRIS: { total: number; count: number };
        DEBIT: { total: number; count: number };
    };
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
        .format(amount)
        .replace("IDR", "Rp");
};

export default function PaymentMethodStats({ paymentMethodBreakdown }: PaymentMethodStatsProps) {
    const { colors } = useTheme();

    const totalAmount =
        paymentMethodBreakdown.CASH.total +
        paymentMethodBreakdown.QRIS.total +
        paymentMethodBreakdown.DEBIT.total;

    const paymentMethods = [
        {
            method: "CASH",
            label: "Tunai",
            icon: Banknote,
            color: "#10b981",
            bgColor: "#d1fae5",
            data: paymentMethodBreakdown.CASH
        },
        {
            method: "QRIS",
            label: "QRIS",
            icon: Smartphone,
            color: "#3b82f6",
            bgColor: "#dbeafe",
            data: paymentMethodBreakdown.QRIS
        },
        {
            method: "DEBIT",
            label: "Debit",
            icon: CreditCard,
            color: "#8b5cf6",
            bgColor: "#ede9fe",
            data: paymentMethodBreakdown.DEBIT
        }
    ];

    const isEmpty = totalAmount === 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textSecondary }]}>
                    Metode Pembayaran Hari Ini
                </Text>
            </View>

            {isEmpty ? (
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
                        <CreditCard size={32} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                        Belum ada transaksi
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                        Data metode pembayaran akan muncul di sini
                    </Text>
                </View>
            ) : (
                <View style={styles.methodsContainer}>
                    {paymentMethods.map((method, index) => {
                        const Icon = method.icon;
                        const percentage = totalAmount > 0 ? (method.data.total / totalAmount) * 100 : 0;
                        const barWidth = percentage;

                        return (
                            <View key={method.method} style={styles.methodRow}>
                                <View style={styles.methodHeader}>
                                    <View style={styles.methodInfo}>
                                        <View style={[styles.iconBadge, { backgroundColor: method.bgColor }]}>
                                            <Icon size={18} color={method.color} strokeWidth={2.5} />
                                        </View>
                                        <Text style={[styles.methodLabel, { color: colors.text }]}>
                                            {method.label}
                                        </Text>
                                    </View>
                                    <View style={styles.methodStats}>
                                        <Text style={[styles.methodTotal, { color: colors.text }]}>
                                            {formatCurrency(method.data.total)}
                                        </Text>
                                        <Text style={[styles.methodCount, { color: colors.textSecondary }]}>
                                            {method.data.count} transaksi
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.barSection}>
                                    <View style={[styles.barBackground, { backgroundColor: colors.background }]}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    backgroundColor: method.color,
                                                    width: `${barWidth}%`,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
                                        {percentage.toFixed(0)}%
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    title: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    emptyContainer: {
        padding: 32,
        alignItems: "center",
        gap: 8,
        minHeight: 200,
        justifyContent: "center",
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 12,
        textAlign: "center",
    },
    methodsContainer: {
        gap: 16,
        minHeight: 234, // Fixed height for 3 methods (similar to top products)
    },
    methodRow: {
        gap: 10,
    },
    methodHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    methodInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    methodLabel: {
        fontSize: 15,
        fontWeight: "600",
        letterSpacing: -0.2,
    },
    methodStats: {
        alignItems: "flex-end",
    },
    methodTotal: {
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    methodCount: {
        fontSize: 11,
        fontWeight: "500",
    },
    barSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    barBackground: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        overflow: "hidden",
    },
    bar: {
        height: "100%",
        borderRadius: 4,
        minWidth: 2,
    },
    percentageText: {
        fontSize: 12,
        fontWeight: "700",
        width: 40,
        textAlign: "right",
        letterSpacing: -0.2,
    },
});
