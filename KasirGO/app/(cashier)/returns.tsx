import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    FlatList,
} from "react-native";
import { RotateCcw, Plus, Package } from "lucide-react-native";
import CashierSidebar from "../../src/components/navigation/CashierSidebar";
import { useTheme } from "../../src/context/ThemeContext";
import { useFocusEffect } from "expo-router";
import { returnService, Return, ReturnableTransaction } from "../../src/api/return";
import SelectReturnTransactionModal from "../../src/components/cashier/SelectReturnTransactionModal";
import ReturnItemsModal from "../../src/components/cashier/ReturnItemsModal";
import ReturnDetailModal from "../../src/components/cashier/ReturnDetailModal";

export default function ReturnsScreen() {
    const { colors } = useTheme();

    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectTransactionModalVisible, setSelectTransactionModalVisible] = useState(false);
    const [returnItemsModalVisible, setReturnItemsModalVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<ReturnableTransaction | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchReturns();
        }, [])
    );

    const fetchReturns = async () => {
        try {
            const today = new Date();
            const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0).toISOString();
            const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString();

            const response = await returnService.getReturns({
                start_date: startDate,
                end_date: endDate,
                page: 1,
                limit: 50,
            });

            if (response.success && response.data) {
                setReturns(response.data);
            }
        } catch (error) {
            console.error("Error fetching returns:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchReturns();
    };

    const handleNewReturn = () => {
        setSelectTransactionModalVisible(true);
    };

    const handleSelectTransaction = (transaction: ReturnableTransaction) => {
        setSelectedTransaction(transaction);
        setReturnItemsModalVisible(true);
    };

    const handleReturnSuccess = () => {
        fetchReturns();
        setSelectedTransaction(null);
    };

    const handleReturnClick = (returnItem: Return) => {
        setSelectedReturn(returnItem);
        setDetailModalVisible(true);
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        return `Rp ${numAmount.toLocaleString("id-ID")}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderReturnItem = ({ item }: { item: Return }) => (
        <TouchableOpacity
            style={[styles.returnCard, { backgroundColor: colors.card }]}
            onPress={() => handleReturnClick(item)}
            activeOpacity={0.7}
        >
            <View style={styles.returnHeader}>
                <View style={[styles.returnIconContainer, { backgroundColor: "#f59e0b20" }]}>
                    <RotateCcw size={20} color="#f59e0b" />
                </View>
                <View style={styles.returnInfo}>
                    <Text style={[styles.returnNumber, { color: colors.text }]}>
                        Retur #{item.return_number}
                    </Text>
                    <Text style={[styles.returnDate, { color: colors.textSecondary }]}>
                        {formatDate(item.created_at)}
                    </Text>
                </View>
            </View>

            <View style={styles.returnDetails}>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Transaksi Asli:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                        #{item.original_transaction_id}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Total Item:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                        {item.t_return_item.length} item
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Total Refund:
                    </Text>
                    <Text style={[styles.detailValue, { color: "#f59e0b", fontWeight: "700" }]}>
                        {formatCurrency(item.refund_amount)}
                    </Text>
                </View>
            </View>

            {item.notes && (
                <View style={[styles.notesBox, { backgroundColor: colors.background }]}>
                    <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                        Catatan:
                    </Text>
                    <Text style={[styles.notesText, { color: colors.text }]}>{item.notes}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.landscapeMaster}>
                <CashierSidebar />
                <View style={styles.landscapeContent}>
                    <View style={[styles.header, { backgroundColor: colors.surface }]}>
                        <View>
                            <Text style={[styles.title, { color: colors.text }]}>Retur</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Kelola pengembalian barang
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                            onPress={handleNewReturn}
                        >
                            <Plus size={20} color="#fff" />
                            <Text style={styles.addButtonText}>Retur Baru</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={[styles.centered, { flex: 1 }]}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                                Memuat data...
                            </Text>
                        </View>
                    ) : returns.length === 0 ? (
                        <ScrollView
                            style={styles.scrollView}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        >
                            <View style={styles.emptyState}>
                                <RotateCcw size={48} color={colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: colors.text }]}>
                                    Belum ada retur hari ini
                                </Text>
                                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                    Tap "Retur Baru" untuk memulai
                                </Text>
                            </View>
                        </ScrollView>
                    ) : (
                        <FlatList
                            data={returns}
                            renderItem={renderReturnItem}
                            keyExtractor={(item) => item.return_id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        />
                    )}
                </View>
            </View>

            <SelectReturnTransactionModal
                visible={selectTransactionModalVisible}
                onClose={() => setSelectTransactionModalVisible(false)}
                onSelectTransaction={handleSelectTransaction}
            />

            <ReturnItemsModal
                visible={returnItemsModalVisible}
                onClose={() => setReturnItemsModalVisible(false)}
                transaction={selectedTransaction}
                onSuccess={handleReturnSuccess}
            />

            <ReturnDetailModal
                visible={detailModalVisible}
                onClose={() => setDetailModalVisible(false)}
                returnData={selectedReturn}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    landscapeMaster: {
        flex: 1,
        flexDirection: "row",
    },
    landscapeContent: {
        flex: 1,
        flexDirection: "column",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
    },
    listContent: {
        padding: 16,
        paddingBottom: 40,
    },
    returnCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    returnHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    returnIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    returnInfo: {
        flex: 1,
    },
    returnNumber: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    returnDate: {
        fontSize: 12,
    },
    returnDetails: {
        gap: 8,
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
    notesBox: {
        marginTop: 12,
        padding: 10,
        borderRadius: 8,
    },
    notesLabel: {
        fontSize: 11,
        fontWeight: "600",
        marginBottom: 4,
    },
    notesText: {
        fontSize: 12,
        lineHeight: 16,
    },
});
