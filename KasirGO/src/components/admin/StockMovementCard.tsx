import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, RefreshCw, RotateCcw } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { StockMovement } from "../../api/stock";

interface StockMovementCardProps {
    movement: StockMovement;
}

export default function StockMovementCard({ movement }: StockMovementCardProps) {
    const { colors } = useTheme();

    const getMovementConfig = () => {
        switch (movement.movement_type) {
            case "IN":
                return {
                    icon: TrendingUp,
                    color: "#10b981",
                    bgColor: "#10b98115",
                    label: "Masuk"
                };
            case "OUT":
                return {
                    icon: TrendingDown,
                    color: "#ef4444",
                    bgColor: "#ef444415",
                    label: "Keluar"
                };
            case "ADJUSTMENT":
                return {
                    icon: RefreshCw,
                    color: "#3b82f6",
                    bgColor: "#3b82f615",
                    label: "Penyesuaian"
                };
            case "RETURN":
                return {
                    icon: RotateCcw,
                    color: "#f59e0b",
                    bgColor: "#f59e0b15",
                    label: "Retur"
                };
        }
    };

    const getReferenceLabel = () => {
        switch (movement.reference_type) {
            case "PURCHASE":
                return "Pembelian";
            case "SALE":
                return "Penjualan";
            case "ADJUSTMENT":
                return "Penyesuaian";
            case "RETURN":
                return "Retur";
            case "OPNAME":
                return "Opname";
            default:
                return movement.reference_type;
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

    const config = getMovementConfig();
    const Icon = config.icon;

    return (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                <Icon size={24} color={config.color} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                        {movement.m_product?.product_name || `Product #${movement.product_id}`}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.typeText, { color: config.color }]}>
                            {config.label}
                        </Text>
                    </View>
                </View>

                {movement.m_product?.product_sku && (
                    <Text style={[styles.sku, { color: colors.textSecondary }]}>
                        SKU: {movement.m_product.product_sku}
                    </Text>
                )}

                <View style={styles.detailRow}>
                    <Text style={[styles.detail, { color: colors.textSecondary }]}>
                        {getReferenceLabel()}
                    </Text>
                    <Text style={[styles.detail, { color: colors.textSecondary }]}>
                        •
                    </Text>
                    <Text style={[styles.detail, { color: colors.textSecondary }]}>
                        {formatDate(movement.created_at)}
                    </Text>
                </View>

                <View style={styles.quantityRow}>
                    <View style={styles.qtyBox}>
                        <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>
                            Sebelum
                        </Text>
                        <Text style={[styles.qtyValue, { color: colors.text }]}>
                            {movement.before_qty}
                        </Text>
                    </View>
                    <View style={styles.arrow}>
                        <Text style={[styles.arrowText, { color: config.color }]}>→</Text>
                    </View>
                    <View style={styles.qtyBox}>
                        <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>
                            Sesudah
                        </Text>
                        <Text style={[styles.qtyValue, { color: config.color }]}>
                            {movement.after_qty}
                        </Text>
                    </View>
                    <View style={[styles.qtyChangeBadge, { backgroundColor: config.bgColor }]}>
                        <Text style={[styles.qtyChangeText, { color: config.color }]}>
                            {movement.movement_type === "IN" || movement.movement_type === "RETURN" ? "+" : "-"}
                            {movement.quantity}
                        </Text>
                    </View>
                </View>

                {movement.notes && (
                    <View style={[styles.notesBox, { backgroundColor: colors.background }]}>
                        <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                            Catatan:
                        </Text>
                        <Text style={[styles.notesText, { color: colors.text }]}>
                            {movement.notes}
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
    productName: {
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
    sku: {
        fontSize: 11,
        marginBottom: 6,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
    },
    detail: {
        fontSize: 12,
    },
    quantityRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 4,
    },
    qtyBox: {
        alignItems: "center",
    },
    qtyLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    qtyValue: {
        fontSize: 16,
        fontWeight: "700",
    },
    arrow: {
        paddingHorizontal: 4,
    },
    arrowText: {
        fontSize: 18,
        fontWeight: "700",
    },
    qtyChangeBadge: {
        marginLeft: "auto",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    qtyChangeText: {
        fontSize: 14,
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
