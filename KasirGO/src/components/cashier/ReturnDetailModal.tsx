import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import { X, RotateCcw, Package } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { Return } from "../../api/return";

interface ReturnDetailModalProps {
    visible: boolean;
    onClose: () => void;
    returnData: Return | null;
}

export default function ReturnDetailModal({
    visible,
    onClose,
    returnData,
}: ReturnDetailModalProps) {
    const { colors } = useTheme();

    if (!returnData) return null;

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        return `Rp ${numAmount.toLocaleString("id-ID")}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRefundMethodText = (method: string) => {
        const methods: { [key: string]: string } = {
            CASH: "Tunai",
            QRIS: "QRIS",
            BANK_TRANSFER: "Transfer Bank",
        };
        return methods[method] || method;
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#f59e0b20" }]}>
                                <RotateCcw size={24} color="#f59e0b" />
                            </View>
                            <View>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    Detail Retur
                                </Text>
                                <Text style={[styles.returnNumber, { color: colors.textSecondary }]}>
                                    Retur #{returnData.return_number}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={[styles.section, { backgroundColor: colors.background }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Informasi Retur
                            </Text>
                            <View style={styles.infoGrid}>
                                <View style={styles.infoRow}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Tanggal & Waktu:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {formatDate(returnData.created_at)}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Transaksi Asli:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        #{returnData.original_transaction_id}
                                    </Text>
                                </View>
                                {returnData.m_user && (
                                    <View style={styles.infoRow}>
                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                            Kasir:
                                        </Text>
                                        <Text style={[styles.infoValue, { color: colors.text }]}>
                                            {returnData.m_user.user_full_name || returnData.m_user.user_name}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.infoRow}>
                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                        Metode Refund:
                                    </Text>
                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {getRefundMethodText(returnData.refund_method)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.background }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Item yang Diretur ({returnData.t_return_item.length})
                            </Text>
                            {returnData.t_return_item.map((item, index) => (
                                <View
                                    key={item.return_item_id}
                                    style={[
                                        styles.itemCard,
                                        { borderBottomColor: colors.border },
                                        index === returnData.t_return_item.length - 1 && styles.lastItemCard,
                                    ]}
                                >
                                    <View style={styles.itemLeft}>
                                        {item.m_product?.product_image_url ? (
                                            <Image
                                                source={{ uri: item.m_product.product_image_url }}
                                                style={styles.productImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.productImagePlaceholder, { backgroundColor: colors.surface }]}>
                                                <Package size={20} color={colors.textSecondary} />
                                            </View>
                                        )}
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.productName, { color: colors.text }]}>
                                                {item.m_product?.product_name || "Produk Tidak Dikenal"}
                                            </Text>
                                            {item.m_product?.product_sku && (
                                                <Text style={[styles.productSku, { color: colors.textSecondary }]}>
                                                    SKU: {item.m_product.product_sku}
                                                </Text>
                                            )}
                                            <Text style={[styles.productPrice, { color: colors.textSecondary }]}>
                                                {formatCurrency(item.price)} × {item.quantity}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.itemSubtotal, { color: colors.text }]}>
                                        {formatCurrency(item.subtotal)}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {returnData.notes && (
                            <View style={[styles.section, { backgroundColor: colors.background }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    Catatan
                                </Text>
                                <Text style={[styles.notesText, { color: colors.text }]}>
                                    {returnData.notes}
                                </Text>
                            </View>
                        )}

                        <View style={[styles.summarySection, { backgroundColor: "#f59e0b10" }]}>
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: colors.text }]}>
                                    Total Retur:
                                </Text>
                                <Text style={[styles.summaryValue, { color: colors.text }]}>
                                    {formatCurrency(returnData.return_total)}
                                </Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryRow}>
                                <Text style={[styles.refundLabel, { color: "#f59e0b" }]}>
                                    Total Refund:
                                </Text>
                                <Text style={[styles.refundValue, { color: "#f59e0b" }]}>
                                    {formatCurrency(returnData.refund_amount)}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        height: "90%",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    returnNumber: {
        fontSize: 13,
        marginTop: 2,
    },
    closeButton: {
        padding: 8,
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 12,
    },
    infoGrid: {
        gap: 10,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    infoLabel: {
        fontSize: 14,
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
        textAlign: "right",
    },
    itemCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    lastItemCard: {
        borderBottomWidth: 0,
    },
    itemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },
    productImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    productImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    itemInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
    },
    productSku: {
        fontSize: 11,
        marginBottom: 2,
    },
    productPrice: {
        fontSize: 12,
    },
    itemSubtotal: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
    },
    notesText: {
        fontSize: 14,
        lineHeight: 20,
    },
    summarySection: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    summaryLabel: {
        fontSize: 15,
        fontWeight: "600",
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: "600",
    },
    summaryDivider: {
        height: 1,
        backgroundColor: "#f59e0b30",
        marginVertical: 12,
    },
    refundLabel: {
        fontSize: 17,
        fontWeight: "700",
    },
    refundValue: {
        fontSize: 17,
        fontWeight: "700",
    },
});
