import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface PaymentModalProps {
    visible: boolean;
    cart: CartItem[];
    onClose: () => void;
    onPaymentComplete: (paymentData: {
        payment_amount: number;
        payment_method: "CASH" | "QRIS" | "DEBIT";
    }) => Promise<void>;
}

export default function PaymentModal({ visible, cart, onClose, onPaymentComplete }: PaymentModalProps) {
    const { colors } = useTheme();
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "DEBIT">("CASH");
    const [processing, setProcessing] = useState(false);

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString("id-ID")}`;
    };

    const calculateChange = () => {
        const payment = parseFloat(paymentAmount) || 0;
        const total = calculateTotal();
        return Math.max(0, payment - total);
    };

    useEffect(() => {
        if (paymentMethod === "QRIS" || paymentMethod === "DEBIT") {
            setPaymentAmount(calculateTotal().toString());
        } else {
            setPaymentAmount("");
        }
    }, [paymentMethod, cart]);

    const handlePayment = async () => {
        const total = calculateTotal();
        let payment: number;

        if (paymentMethod === "QRIS" || paymentMethod === "DEBIT") {
            payment = total;
        } else {
            payment = parseFloat(paymentAmount);
            if (!paymentAmount) {
                Alert.alert("Error", "Silakan masukkan jumlah pembayaran");
                return;
            }
            if (payment < total) {
                Alert.alert("Error", "Pembayaran tidak boleh kurang dari total");
                return;
            }
        }

        setProcessing(true);
        try {
            await onPaymentComplete({
                payment_amount: payment,
                payment_method: paymentMethod,
            });
            handleClose();
        } catch (error: any) {
            Alert.alert("Error", error.message || "Gagal memproses pembayaran");
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        if (!processing) {
            setPaymentAmount("");
            setPaymentMethod("CASH");
            onClose();
        }
    };

    const total = calculateTotal();
    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>Pembayaran</Text>
                        <TouchableOpacity onPress={handleClose} disabled={processing}>
                            <X size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.cartSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ringkasan Pesanan</Text>
                            <View style={[styles.cartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {cart.map((item, index) => (
                                    <View key={item.id} style={[styles.cartItem, index < cart.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                                        <View style={styles.itemLeft}>
                                            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                                                {formatCurrency(item.price)} × {item.quantity}
                                            </Text>
                                        </View>
                                        <Text style={[styles.itemPrice, { color: colors.text }]}>
                                            {formatCurrency(item.price * item.quantity)}
                                        </Text>
                                    </View>
                                ))}
                                <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                                    <Text style={[styles.totalValue, { color: colors.primary }]}>
                                        {formatCurrency(total)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.methodSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Metode Pembayaran</Text>
                            <View style={styles.methodButtons}>
                                {(['CASH', 'QRIS', 'DEBIT'] as const).map((method) => (
                                    <TouchableOpacity
                                        key={method}
                                        style={[
                                            styles.methodButton,
                                            {
                                                backgroundColor: paymentMethod === method ? colors.primary : colors.card,
                                                borderColor: paymentMethod === method ? colors.primary : colors.border
                                            }
                                        ]}
                                        onPress={() => setPaymentMethod(method)}
                                    >
                                        <Text style={[styles.methodText, { color: paymentMethod === method ? "#fff" : colors.text }]}>
                                            {method === 'CASH' ? 'Tunai' : method}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {paymentMethod === "CASH" ? (
                            <View style={styles.amountSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Jumlah Pembayaran</Text>
                                <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                                    <Text style={[styles.currency, { color: colors.textSecondary }]}>Rp</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        value={paymentAmount}
                                        onChangeText={setPaymentAmount}
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        keyboardType="numeric"
                                    />
                                </View>
                                {paymentAmount && parseFloat(paymentAmount) >= total && (
                                    <View style={[styles.changeBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
                                        <Text style={[styles.changeLabel, { color: colors.textSecondary }]}>Kembalian:</Text>
                                        <Text style={[styles.changeValue, { color: colors.primary }]}>
                                            {formatCurrency(calculateChange())}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.amountSection}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Total Pembayaran</Text>
                                <View style={[styles.totalPaymentCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary }]}>
                                    <Text style={[styles.totalPaymentLabel, { color: colors.textSecondary }]}>Jumlah yang akan dibayar:</Text>
                                    <Text style={[styles.totalPaymentValue, { color: colors.primary }]}>
                                        {formatCurrency(total)}
                                    </Text>
                                </View>
                                <Text style={[styles.paymentNote, { color: colors.textSecondary }]}>
                                    Pembayaran {paymentMethod} akan otomatis menggunakan jumlah yang pas
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.payButton, { backgroundColor: colors.primary }, processing && { opacity: 0.6 }]}
                            onPress={handlePayment}
                            disabled={processing}
                        >
                            {processing ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.payButtonText}>Selesaikan Pembayaran</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "90%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    cartSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    cartCard: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
    },
    cartItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
    },
    itemLeft: {
        flex: 1,
        paddingRight: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    itemDetail: {
        fontSize: 13,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: "600",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 16,
        marginTop: 8,
        borderTopWidth: 2,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "700",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    methodSection: {
        marginBottom: 24,
    },
    methodButtons: {
        flexDirection: "row",
        gap: 8,
    },
    methodButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: "center",
    },
    methodText: {
        fontSize: 15,
        fontWeight: "700",
    },
    amountSection: {
        marginBottom: 24,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currency: {
        fontSize: 18,
        fontWeight: "600",
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        paddingVertical: 16,
    },
    changeBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
    },
    changeLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    changeValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    totalPaymentCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
    },
    totalPaymentLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    totalPaymentValue: {
        fontSize: 24,
        fontWeight: "700",
    },
    paymentNote: {
        fontSize: 13,
        marginTop: 8,
        fontStyle: "italic",
        textAlign: "center",
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    payButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    payButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
