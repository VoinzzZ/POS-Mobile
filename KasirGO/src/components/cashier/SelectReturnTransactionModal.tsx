import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TextInput,
} from "react-native";
import { X, Search, ChevronRight, Package } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { returnService, ReturnableTransaction } from "../../api/return";

interface SelectReturnTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectTransaction: (transaction: ReturnableTransaction) => void;
}

export default function SelectReturnTransactionModal({
    visible,
    onClose,
    onSelectTransaction,
}: SelectReturnTransactionModalProps) {
    const { colors } = useTheme();
    const [transactions, setTransactions] = useState<ReturnableTransaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<ReturnableTransaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (visible) {
            fetchTransactions();
        }
    }, [visible]);

    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const filtered = transactions.filter(
                (t) =>
                    t.dailyNumber?.toString().includes(query) ||
                    t.items.some((item) => item.product.name.toLowerCase().includes(query))
            );
            setFilteredTransactions(filtered);
        } else {
            setFilteredTransactions(transactions);
        }
    }, [searchQuery, transactions]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await returnService.getReturnableTransactions();
            if (response.success && response.data) {
                setTransactions(response.data);
                setFilteredTransactions(response.data);
            }
        } catch (error) {
            console.error("Error fetching returnable transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString("id-ID")}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSelectTransaction = (transaction: ReturnableTransaction) => {
        onSelectTransaction(transaction);
        onClose();
    };

    const renderTransactionItem = ({ item }: { item: ReturnableTransaction }) => (
        <TouchableOpacity
            style={[styles.transactionCard, { backgroundColor: colors.card }]}
            onPress={() => handleSelectTransaction(item)}
        >
            <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionNumber, { color: colors.text }]}>
                        Transaksi #{item.dailyNumber || item.id}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                        {formatDate(item.completedAt || item.createdAt)}
                    </Text>
                </View>
                <ChevronRight size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.transactionDetails}>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Total Item:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                        {item.items.length} item
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Total:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.primary, fontWeight: "700" }]}>
                        {formatCurrency(item.total)}
                    </Text>
                </View>
            </View>

            <View style={styles.productPreview}>
                {item.items.slice(0, 2).map((product, index) => (
                    <Text
                        key={index}
                        style={[styles.productPreviewText, { color: colors.textSecondary }]}
                        numberOfLines={1}
                    >
                        • {product.product.name} ({product.quantity}x)
                    </Text>
                ))}
                {item.items.length > 2 && (
                    <Text style={[styles.productPreviewText, { color: colors.textSecondary }]}>
                        +{item.items.length - 2} produk lainnya
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={[styles.container, { backgroundColor: colors.surface }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Pilih Transaksi</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                        <Search size={18} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Cari transaksi atau produk..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <X size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.infoBox}>
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            Menampilkan transaksi dari 3 hari terakhir
                        </Text>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Memuat transaksi...
                            </Text>
                        </View>
                    ) : filteredTransactions.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Package size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>
                                {searchQuery ? "Tidak ada hasil" : "Tidak ada transaksi"}
                            </Text>
                            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                {searchQuery
                                    ? "Coba kata kunci lain"
                                    : "Belum ada transaksi yang dapat diretur"}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredTransactions}
                            renderItem={renderTransactionItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
    },
    infoBox: {
        marginHorizontal: 20,
        marginTop: 12,
        padding: 12,
        backgroundColor: "#3b82f615",
        borderRadius: 8,
    },
    infoText: {
        fontSize: 12,
        textAlign: "center",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 14,
        marginTop: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 13,
        marginTop: 6,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    transactionCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    transactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    transactionInfo: {
        flex: 1,
    },
    transactionNumber: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
    },
    transactionDetails: {
        gap: 6,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    detailLabel: {
        fontSize: 13,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: "500",
    },
    productPreview: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#334155",
        gap: 4,
    },
    productPreviewText: {
        fontSize: 12,
    },
});
