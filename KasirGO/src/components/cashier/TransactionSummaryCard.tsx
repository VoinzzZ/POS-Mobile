import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface TransactionItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string;
    };
}

interface TransactionSummaryCardProps {
    transactionId: number;
    items: TransactionItem[];
    total: number;
    maxHeight?: number;
}

export default function TransactionSummaryCard({
    transactionId,
    items,
    total,
    maxHeight = 400,
}: TransactionSummaryCardProps) {
    const { colors } = useTheme();

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString("id-ID")}`;
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Ringkasan Pesanan</Text>
                <Text style={[styles.transactionId, { color: colors.textSecondary }]}>
                    Transaksi #{transactionId}
                </Text>
            </View>

            <ScrollView
                style={[styles.itemsScroll, { maxHeight }]}
                showsVerticalScrollIndicator={false}
            >
                {items.map((item) => (
                    <View key={item.id} style={[styles.item, { borderBottomColor: colors.border }]}>
                        <View style={styles.itemInfo}>
                            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                                {item.product.name}
                            </Text>
                            <Text style={[styles.itemDetails, { color: colors.textSecondary }]}>
                                {formatCurrency(item.price)} × {item.quantity}
                            </Text>
                        </View>
                        <Text style={[styles.itemTotal, { color: colors.text }]}>
                            {formatCurrency(item.subtotal)}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                <Text style={[styles.totalAmount, { color: colors.primary }]}>
                    {formatCurrency(total)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    header: {
        gap: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    transactionId: {
        fontSize: 14,
    },
    itemsScroll: {
        flexGrow: 0,
    },
    item: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    itemInfo: {
        flex: 1,
        paddingRight: 12,
        gap: 4,
    },
    itemName: {
        fontSize: 15,
        fontWeight: "600",
    },
    itemDetails: {
        fontSize: 13,
    },
    itemTotal: {
        fontSize: 15,
        fontWeight: "600",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        marginTop: 8,
        borderTopWidth: 2,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "700",
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: "700",
    },
});
