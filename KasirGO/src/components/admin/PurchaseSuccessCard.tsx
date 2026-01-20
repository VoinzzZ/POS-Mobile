import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle, Package, Wallet, TrendingUp } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface PurchaseSuccessCardProps {
    productName: string;
    quantity: number;
    oldQty: number;
    newQty: number;
    totalAmount: number;
    transactionNumber: string;
    onViewDetails?: () => void;
    onAddAnother?: () => void;
}

export default function PurchaseSuccessCard({
    productName,
    quantity,
    oldQty,
    newQty,
    totalAmount,
    transactionNumber,
    onViewDetails,
    onAddAnother,
}: PurchaseSuccessCardProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: "#10b981" + "15" }]}>
                    <CheckCircle size={48} color="#10b981" />
                </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Pembelian Tercatat!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Transaksi #{transactionNumber}
            </Text>

            <View style={styles.detailsContainer}>
                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.detailLeft}>
                        <Package size={18} color={colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                            Produk
                        </Text>
                    </View>
                    <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                        {productName}
                    </Text>
                </View>

                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.detailLeft}>
                        <TrendingUp size={18} color={colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                            Perubahan Stok
                        </Text>
                    </View>
                    <Text style={[styles.detailValue, { color: "#10b981" }]}>
                        {oldQty} → {newQty} (+{quantity})
                    </Text>
                </View>

                <View style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                        <Wallet size={18} color={colors.textSecondary} />
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                            Total Biaya
                        </Text>
                    </View>
                    <Text style={[styles.detailValue, styles.totalAmount, { color: colors.primary }]}>
                        Rp {totalAmount.toLocaleString("id-ID")}
                    </Text>
                </View>
            </View>

            {(onViewDetails || onAddAnother) && (
                <View style={styles.actionsContainer}>
                    {onViewDetails && (
                        <TouchableOpacity
                            onPress={onViewDetails}
                            style={[styles.actionButton, { backgroundColor: colors.background }]}
                        >
                            <Text style={[styles.actionButtonText, { color: colors.text }]}>
                                Lihat Detail
                            </Text>
                        </TouchableOpacity>
                    )}
                    {onAddAnother && (
                        <TouchableOpacity
                            onPress={onAddAnother}
                            style={[styles.actionButton, styles.primaryButton, { backgroundColor: colors.primary }]}
                        >
                            <Text style={styles.primaryButtonText}>Tambah Lagi</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    iconContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    detailsContainer: {
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    detailLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    detailLabel: {
        fontSize: 14,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
        textAlign: "right",
    },
    totalAmount: {
        fontSize: 18,
    },
    actionsContainer: {
        flexDirection: "row",
        gap: 10,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    primaryButton: {},
    primaryButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
