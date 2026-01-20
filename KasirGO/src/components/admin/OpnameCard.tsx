import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StockOpname } from "../../api/opname";
import { useTheme } from "../../context/ThemeContext";
import { Package, CheckCircle, Clock, AlertCircle } from "lucide-react-native";
import { formatCurrency } from "../../utils/inventoryCalculations";

interface OpnameCardProps {
    opname: StockOpname;
    onProcess?: (opnameId: number) => void;
}

export default function OpnameCard({ opname, onProcess }: OpnameCardProps) {
    const { colors } = useTheme();

    const getDifferenceColor = () => {
        if (opname.difference === 0) return "#10b981";
        if (opname.difference > 0) return "#3b82f6";
        return "#ef4444";
    };

    const getDifferenceIcon = () => {
        if (opname.difference === 0)
            return <CheckCircle size={18} color="#10b981" />;
        if (opname.difference > 0)
            return <AlertCircle size={18} color="#3b82f6" />;
        return <AlertCircle size={18} color="#ef4444" />;
    };

    const getDifferenceLabel = () => {
        if (opname.difference === 0) return "Cocok";
        if (opname.difference > 0) return "Surplus";
        return "Kurang";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return "Baru saja";
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays === 1) return "Kemarin";
        if (diffDays < 7) return `${diffDays} hari lalu`;

        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <View style={styles.productInfo}>
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: colors.primary + "20" },
                        ]}
                    >
                        <Package size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.productName, { color: colors.text }]}>
                            {opname.m_product?.product_name}
                        </Text>
                        {opname.m_product?.product_sku && (
                            <Text
                                style={[styles.productSku, { color: colors.textSecondary }]}
                            >
                                SKU: {opname.m_product.product_sku}
                            </Text>
                        )}
                    </View>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        {
                            backgroundColor: opname.processed
                                ? "#10b981" + "20"
                                : "#f59e0b" + "20",
                        },
                    ]}
                >
                    {opname.processed ? (
                        <CheckCircle size={14} color="#10b981" />
                    ) : (
                        <Clock size={14} color="#f59e0b" />
                    )}
                    <Text
                        style={[
                            styles.statusText,
                            { color: opname.processed ? "#10b981" : "#f59e0b" },
                        ]}
                    >
                        {opname.processed ? "Diproses" : "Belum Diproses"}
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.qtyRow}>
                    <View style={styles.qtyBox}>
                        <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>
                            Sistem
                        </Text>
                        <Text style={[styles.qtyValue, { color: colors.text }]}>
                            {opname.system_qty}
                        </Text>
                    </View>

                    <View style={styles.arrow}>
                        <Text style={[styles.arrowText, { color: colors.textSecondary }]}>
                            →
                        </Text>
                    </View>

                    <View style={styles.qtyBox}>
                        <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>
                            Aktual
                        </Text>
                        <Text style={[styles.qtyValue, { color: colors.text }]}>
                            {opname.actual_qty}
                        </Text>
                    </View>
                </View>

                <View
                    style={[
                        styles.differenceBadge,
                        { backgroundColor: getDifferenceColor() + "20" },
                    ]}
                >
                    {getDifferenceIcon()}
                    <Text
                        style={[
                            styles.differenceLabel,
                            { color: getDifferenceColor() },
                        ]}
                    >
                        {getDifferenceLabel()}
                    </Text>
                    <Text
                        style={[
                            styles.differenceValue,
                            { color: getDifferenceColor() },
                        ]}
                    >
                        {opname.difference > 0 ? "+" : ""}
                        {opname.difference}
                    </Text>
                </View>
            </View>

            {opname.notes && (
                <View
                    style={[
                        styles.notesContainer,
                        { backgroundColor: colors.background },
                    ]}
                >
                    <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                        Catatan:
                    </Text>
                    <Text style={[styles.notesText, { color: colors.text }]}>
                        {opname.notes}
                    </Text>
                </View>
            )}

            <View style={styles.footer}>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    {formatDate(opname.created_at)}
                </Text>

                {!opname.processed && opname.difference !== 0 && onProcess && (
                    <TouchableOpacity
                        style={[styles.processButton, { backgroundColor: colors.primary }]}
                        onPress={() => onProcess(opname.opname_id)}
                    >
                        <Text style={styles.processButtonText}>Proses Adjustment</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    productInfo: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    productName: {
        fontSize: 15,
        fontWeight: "600",
    },
    productSku: {
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    content: {
        marginBottom: 12,
    },
    qtyRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    qtyBox: {
        flex: 1,
        alignItems: "center",
    },
    qtyLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    qtyValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    arrow: {
        paddingHorizontal: 12,
    },
    arrowText: {
        fontSize: 20,
    },
    differenceBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    differenceLabel: {
        fontSize: 13,
        fontWeight: "600",
    },
    differenceValue: {
        fontSize: 16,
        fontWeight: "700",
    },
    notesContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    notesLabel: {
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 4,
    },
    notesText: {
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateText: {
        fontSize: 12,
    },
    processButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    processButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
});
