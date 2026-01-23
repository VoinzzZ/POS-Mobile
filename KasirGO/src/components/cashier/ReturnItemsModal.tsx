import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { X, RotateCcw, Plus, Minus, AlertCircle } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { ReturnableTransaction, returnService, ReturnItem } from "../../api/return";

interface ReturnItemsModalProps {
    visible: boolean;
    onClose: () => void;
    transaction: ReturnableTransaction | null;
    onSuccess: () => void;
}

interface SelectedItem {
    product_id: number;
    product_name: string;
    product_sku?: string;
    max_quantity: number;
    price: number;
    quantity: number;
}

export default function ReturnItemsModal({
    visible,
    onClose,
    transaction,
    onSuccess,
}: ReturnItemsModalProps) {
    const { colors } = useTheme();
    const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItem>>(new Map());
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleIncreaseQuantity = (item: any) => {
        const current = selectedItems.get(item.productId);
        const newQty = current ? Math.min(current.quantity + 1, item.quantity) : 1;

        const newMap = new Map(selectedItems);
        newMap.set(item.productId, {
            product_id: item.productId,
            product_name: item.product.name,
            product_sku: item.product.sku,
            max_quantity: item.quantity,
            price: item.price,
            quantity: newQty,
        });
        setSelectedItems(newMap);
    };

    const handleDecreaseQuantity = (productId: number) => {
        const current = selectedItems.get(productId);
        if (!current) return;

        if (current.quantity <= 1) {
            const newMap = new Map(selectedItems);
            newMap.delete(productId);
            setSelectedItems(newMap);
        } else {
            const newMap = new Map(selectedItems);
            newMap.set(productId, { ...current, quantity: current.quantity - 1 });
            setSelectedItems(newMap);
        }
    };

    const handleQuantityInput = (productId: number, value: string) => {
        const current = selectedItems.get(productId);
        if (!current) return;

        const numValue = parseInt(value) || 0;
        const clampedValue = Math.max(0, Math.min(numValue, current.max_quantity));

        if (clampedValue === 0) {
            const newMap = new Map(selectedItems);
            newMap.delete(productId);
            setSelectedItems(newMap);
        } else {
            const newMap = new Map(selectedItems);
            newMap.set(productId, { ...current, quantity: clampedValue });
            setSelectedItems(newMap);
        }
    };

    const calculateTotal = () => {
        let total = 0;
        selectedItems.forEach((item) => {
            total += item.price * item.quantity;
        });
        return total;
    };

    const handleSubmit = async () => {
        if (selectedItems.size === 0) {
            Alert.alert("Peringatan", "Pilih minimal 1 item untuk diretur");
            return;
        }

        if (!transaction) return;

        Alert.alert(
            "Konfirmasi Retur",
            `Yakin ingin melakukan retur dengan total pengembalian ${formatCurrency(calculateTotal())}?`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Proses",
                    style: "default",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const items: ReturnItem[] = Array.from(selectedItems.values()).map((item) => ({
                                product_id: item.product_id,
                                quantity: item.quantity,
                            }));

                            const response = await returnService.createReturn({
                                transaction_id: transaction.id,
                                items,
                                notes: notes || undefined,
                            });

                            if (response.success) {
                                Alert.alert("Berhasil", "Retur berhasil diproses", [
                                    {
                                        text: "OK",
                                        onPress: () => {
                                            resetForm();
                                            onSuccess();
                                            onClose();
                                        },
                                    },
                                ]);
                            } else {
                                Alert.alert("Gagal", response.message || "Gagal memproses retur");
                            }
                        } catch (error: any) {
                            Alert.alert("Error", error.message || "Terjadi kesalahan");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setSelectedItems(new Map());
        setNotes("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString("id-ID")}`;
    };

    if (!transaction) return null;

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
                <View style={[styles.container, { backgroundColor: colors.surface }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <RotateCcw size={20} color={colors.primary} />
                            <View>
                                <Text style={[styles.title, { color: colors.text }]}>Proses Retur</Text>
                                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                    Transaksi #{transaction.dailyNumber || transaction.id}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.warningBox, { backgroundColor: "#f59e0b15" }]}>
                        <AlertCircle size={16} color="#f59e0b" />
                        <Text style={[styles.warningText, { color: "#f59e0b" }]}>
                            Refund akan dikembalikan dengan metode CASH
                        </Text>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Pilih Item yang Akan Diretur
                        </Text>

                        {transaction.items.map((item) => {
                            const selected = selectedItems.get(item.productId);
                            const isSelected = !!selected;

                            return (
                                <View
                                    key={item.id}
                                    style={[
                                        styles.itemCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderWidth: isSelected ? 2 : 1,
                                        },
                                    ]}
                                >
                                    <View style={styles.itemInfo}>
                                        <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                                            {item.product.name}
                                        </Text>
                                        {item.product.sku && (
                                            <Text style={[styles.itemSku, { color: colors.textSecondary }]}>
                                                SKU: {item.product.sku}
                                            </Text>
                                        )}
                                        <View style={styles.itemPriceRow}>
                                            <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
                                                {formatCurrency(item.price)} × {item.quantity}
                                            </Text>
                                            <Text style={[styles.itemSubtotal, { color: colors.text }]}>
                                                {formatCurrency(item.subtotal)}
                                            </Text>
                                        </View>
                                    </View>

                                    {isSelected ? (
                                        <View style={styles.quantityControl}>
                                            <TouchableOpacity
                                                style={[styles.quantityButton, { backgroundColor: colors.primary + "20" }]}
                                                onPress={() => handleDecreaseQuantity(item.productId)}
                                            >
                                                <Minus size={16} color={colors.primary} />
                                            </TouchableOpacity>

                                            <TextInput
                                                style={[styles.quantityInput, { color: colors.text }]}
                                                value={selected.quantity.toString()}
                                                keyboardType="numeric"
                                                onChangeText={(value) => handleQuantityInput(item.productId, value)}
                                                selectTextOnFocus
                                            />

                                            <TouchableOpacity
                                                style={[styles.quantityButton, { backgroundColor: colors.primary + "20" }]}
                                                onPress={() => handleIncreaseQuantity(item)}
                                            >
                                                <Plus size={16} color={colors.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                                            onPress={() => handleIncreaseQuantity(item)}
                                        >
                                            <Plus size={18} color="#fff" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}

                        <View style={styles.notesContainer}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Catatan (opsional)
                            </Text>
                            <TextInput
                                style={[styles.notesInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                placeholder="Tulis catatan retur..."
                                placeholderTextColor={colors.textSecondary}
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <View style={styles.totalContainer}>
                            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                                Total Pengembalian:
                            </Text>
                            <Text style={[styles.totalValue, { color: colors.primary }]}>
                                {formatCurrency(calculateTotal())}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                {
                                    backgroundColor: selectedItems.size > 0 ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={handleSubmit}
                            disabled={loading || selectedItems.size === 0}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Proses Retur</Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    warningBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 20,
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
    },
    warningText: {
        fontSize: 12,
        flex: 1,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    itemCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    itemInfo: {
        flex: 1,
        marginRight: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    itemSku: {
        fontSize: 11,
        marginBottom: 6,
    },
    itemPriceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemPrice: {
        fontSize: 12,
    },
    itemSubtotal: {
        fontSize: 13,
        fontWeight: "600",
    },
    quantityControl: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityInput: {
        width: 40,
        height: 32,
        textAlign: "center",
        fontSize: 14,
        fontWeight: "600",
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    notesContainer: {
        marginTop: 16,
    },
    notesInput: {
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        borderWidth: 1,
        minHeight: 80,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        gap: 12,
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 14,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
