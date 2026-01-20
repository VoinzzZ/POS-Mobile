import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { X, Package, Minus, Plus } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { Product } from "../../api/product";

interface PurchaseInputModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
    onSubmit: (data: {
        quantity: number;
        total_price: number;
        notes: string;
    }) => void;
    loading?: boolean;
}

export default function PurchaseInputModal({
    visible,
    product,
    onClose,
    onSubmit,
    loading = false,
}: PurchaseInputModalProps) {
    const { colors } = useTheme();

    const [quantity, setQuantity] = useState("1");
    const [totalPrice, setTotalPrice] = useState("");
    const [notes, setNotes] = useState("");

    const handleClose = () => {
        setQuantity("1");
        setTotalPrice("");
        setNotes("");
        onClose();
    };

    const handleSubmit = () => {
        const qty = parseInt(quantity);
        const total = parseFloat(totalPrice);

        if (qty <= 0 || isNaN(qty)) {
            alert("Quantity must be greater than 0");
            return;
        }

        if (total <= 0 || isNaN(total)) {
            alert("Total price must be greater than 0");
            return;
        }

        onSubmit({
            quantity: qty,
            total_price: total,
            notes: notes.trim(),
        });
    };

    const incrementQuantity = () => {
        const current = parseInt(quantity) || 0;
        setQuantity((current + 1).toString());
    };

    const decrementQuantity = () => {
        const current = parseInt(quantity) || 0;
        if (current > 1) {
            setQuantity((current - 1).toString());
        }
    };

    const qty = parseInt(quantity) || 0;
    const total = parseFloat(totalPrice) || 0;
    const costPerUnit = qty > 0 ? total / qty : 0;

    if (!product) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <View style={[styles.modal, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.headerIcon, { backgroundColor: colors.primary + "15" }]}>
                                <Package size={20} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>
                                    Record Purchase
                                </Text>
                                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                                    {product.product_name}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                Current Stock
                            </Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                {product.product_qty} units
                            </Text>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                Last Cost
                            </Text>
                            <Text style={[styles.infoValue, { color: colors.text }]}>
                                Rp {(product.product_cost || 0).toLocaleString("id-ID")}
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Quantity <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.quantityContainer}>
                                <TouchableOpacity
                                    onPress={decrementQuantity}
                                    style={[styles.quantityButton, { backgroundColor: colors.card }]}
                                >
                                    <Minus size={20} color={colors.text} />
                                </TouchableOpacity>
                                <TextInput
                                    style={[
                                        styles.quantityInput,
                                        { backgroundColor: colors.card, color: colors.text },
                                    ]}
                                    value={quantity}
                                    onChangeText={setQuantity}
                                    keyboardType="number-pad"
                                    textAlign="center"
                                />
                                <TouchableOpacity
                                    onPress={incrementQuantity}
                                    style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                                >
                                    <Plus size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Total Price <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
                                <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>Rp</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    value={totalPrice}
                                    onChangeText={setTotalPrice}
                                    placeholder="Enter total price for all items"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            {qty > 0 && total > 0 && (
                                <Text style={[styles.calculatedCost, { color: colors.textSecondary }]}>
                                    Cost per unit: Rp {costPerUnit.toLocaleString("id-ID")}
                                </Text>
                            )}
                        </View>



                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.text }]}>Notes (Optional)</Text>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    { backgroundColor: colors.card, color: colors.text },
                                ]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add purchase notes (e.g., supplier name, invoice number)"
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={[styles.totalCard, { backgroundColor: colors.primary + "10" }]}>
                            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                            <Text style={[styles.totalValue, { color: colors.primary }]}>
                                Rp {total.toLocaleString("id-ID")}
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={[styles.button, styles.cancelButton, { backgroundColor: colors.card }]}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            style={[
                                styles.button,
                                styles.submitButton,
                                { backgroundColor: colors.primary },
                                loading && styles.buttonDisabled,
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitButtonText}>Confirm Purchase</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
        height: "90%",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    infoLabel: {
        fontSize: 12,
        width: "48%",
    },
    infoValue: {
        fontSize: 16,
        fontWeight: "600",
        width: "48%",
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
    },
    required: {
        color: "#ef4444",
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    quantityButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityInput: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        fontSize: 20,
        fontWeight: "700",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 14,
        gap: 10,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 15,
    },
    currencyPrefix: {
        fontSize: 16,
        fontWeight: "600",
        marginRight: 4,
    },
    calculatedCost: {
        fontSize: 12,
        marginTop: 6,
        fontStyle: "italic",
    },
    textArea: {
        borderRadius: 12,
        padding: 14,
        fontSize: 14,
        minHeight: 80,
    },
    totalCard: {
        padding: 16,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: "600",
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "700",
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {},
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
    },
    submitButton: {},
    submitButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
