import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BanknoteArrowUp, BanknoteArrowDown, ShoppingCart, Check } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { CashTransaction } from "../../api/cashTransaction";

interface TransactionTrafficCardProps {
    transaction: CashTransaction;
}

export default function TransactionTrafficCard({ transaction }: TransactionTrafficCardProps) {
    const { colors } = useTheme();

    const getTransactionConfig = () => {
        switch (transaction.transaction_type) {
            case "INCOME":
                return {
                    icon: BanknoteArrowUp,
                    color: "#10b981",
                    bgColor: "#10b98115",
                    label: "Pemasukan"
                };
            case "EXPENSE":
                return {
                    icon: BanknoteArrowDown,
                    color: "#ef4444",
                    bgColor: "#ef444415",
                    label: "Pengeluaran"
                };
        }
    };

    const getPaymentMethodLabel = () => {
        switch (transaction.payment_method) {
            case "CASH":
                return "Tunai";
            case "QRIS":
                return "QRIS";
            case "DEBIT":
                return "Debit";
            default:
                return transaction.payment_method;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isToday = date.toDateString() === today.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const time = date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        });

        if (isToday) return `Hari ini, ${time}`;
        if (isYesterday) return `Kemarin, ${time}`;

        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const config = getTransactionConfig();
    const Icon = config.icon;

    const getDescription = () => {
        if (transaction.description) return transaction.description;

        if (transaction.category_type === "SALES") return "Penjualan";
        if (transaction.t_expense_category) return transaction.t_expense_category.category_name;

        return transaction.transaction_type === "INCOME" ? "Pemasukan" : "Pengeluaran";
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                <Icon size={24} color={config.color} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.transactionNumber, { color: colors.text }]} numberOfLines={1}>
                        {getDescription()}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.typeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>

                <View style={styles.detailRow}>
                    <Text style={[styles.detail, { color: colors.textSecondary }]}>
                        {getPaymentMethodLabel()}
                    </Text>
                    <Text style={[styles.detail, { color: colors.textSecondary }]}>
                        •
                    </Text>
                    <Text style={[styles.detail, { color: colors.textSecondary }]}>
                        {formatDate(transaction.transaction_date)}
                    </Text>
                    {transaction.is_verified && (
                        <>
                            <Text style={[styles.detail, { color: colors.textSecondary }]}>
                                •
                            </Text>
                            <View style={styles.verifiedBadge}>
                                <Check size={12} color="#10b981" />
                                <Text style={[styles.verifiedText, { color: "#10b981" }]}>
                                    Terverifikasi
                                </Text>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.amountRow}>
                    <View style={[styles.amountBadge, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.amountText, { color: config.color }]}>
                            {transaction.transaction_type === "INCOME" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                        </Text>
                    </View>
                </View>

                {transaction.notes && (
                    <View style={[styles.notesBox, { backgroundColor: colors.background }]}>
                        <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                            Catatan:
                        </Text>
                        <Text style={[styles.notesText, { color: colors.text }]}>
                            {transaction.notes}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    transactionNumber: {
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
        marginRight: 8,
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        fontSize: 11,
        fontWeight: "600",
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
        flexWrap: "wrap",
    },
    detail: {
        fontSize: 12,
    },
    verifiedBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: "600",
    },
    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    amountBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    amountText: {
        fontSize: 16,
        fontWeight: "700",
    },
    notesBox: {
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
    },
    notesLabel: {
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 2,
    },
    notesText: {
        fontSize: 12,
        lineHeight: 16,
    },
});
