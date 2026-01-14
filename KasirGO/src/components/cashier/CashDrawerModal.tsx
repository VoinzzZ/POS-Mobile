import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { X, Wallet, DollarSign, LogOut } from "lucide-react-native";
import { openCashDrawer, closeCashDrawer } from "../../api/cashDrawer";
import { formatCurrency } from "../../utils/financial.helpers";
import { useTheme } from "../../context/ThemeContext";

interface CashDrawerModalProps {
    visible: boolean;
    mode: "open" | "close";
    currentDrawer?: {
        drawer_id: number;
        opening_balance: number;
        cash_in_transactions: number;
        cash_out_refunds: number;
    } | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CashDrawerModal({
    visible,
    mode,
    currentDrawer,
    onClose,
    onSuccess,
}: CashDrawerModalProps) {
    const { colors } = useTheme();
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const expectedBalance = currentDrawer
        ? parseFloat(currentDrawer.opening_balance.toString()) +
        parseFloat(currentDrawer.cash_in_transactions.toString()) -
        parseFloat(currentDrawer.cash_out_refunds.toString())
        : 0;

    const handleSubmit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError("Masukkan jumlah uang yang valid");
            return;
        }

        try {
            setLoading(true);
            setError("");

            if (mode === "open") {
                await openCashDrawer(parseFloat(amount));
            } else if (mode === "close" && currentDrawer) {
                await closeCashDrawer(currentDrawer.drawer_id, parseFloat(amount), notes || undefined);
            }

            setAmount("");
            setNotes("");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const difference = mode === "close" && amount ? parseFloat(amount) - expectedBalance : 0;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={[styles.modal, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            {mode === "open" ? (
                                <Wallet size={24} color={colors.primary} />
                            ) : (
                                <LogOut size={24} color={colors.primary} />
                            )}
                            <Text style={[styles.title, { color: colors.text }]}>
                                {mode === "open" ? "Buka Shift" : "Tutup Shift"}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Expected Balance (Close Mode Only) */}
                        {mode === "close" && currentDrawer && (
                            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                    Saldo yang Diharapkan
                                </Text>
                                <Text style={[styles.infoValue, { color: colors.text }]}>
                                    {formatCurrency(expectedBalance)}
                                </Text>
                                <View style={styles.breakdown}>
                                    <Text style={[styles.breakdownText, { color: colors.textSecondary }]}>
                                        Modal: {formatCurrency(currentDrawer.opening_balance)}
                                    </Text>
                                    <Text style={[styles.breakdownText, { color: colors.textSecondary }]}>
                                        + Cash In: {formatCurrency(currentDrawer.cash_in_transactions)}
                                    </Text>
                                    <Text style={[styles.breakdownText, { color: colors.textSecondary }]}>
                                        - Cash Out: {formatCurrency(currentDrawer.cash_out_refunds)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Amount Input */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                {mode === "open" ? "Modal Awal (Rp)" : "Uang Sebenarnya (Rp)"}
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <DollarSign size={20} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="Contoh: 500000"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>
                        </View>

                        {/* Difference Display (Close Mode) */}
                        {mode === "close" && amount && (
                            <View
                                style={[
                                    styles.differenceCard,
                                    {
                                        backgroundColor:
                                            difference === 0 ? "#ECFDF5" : difference > 0 ? "#FEF3C7" : "#FEE2E2",
                                        borderColor:
                                            difference === 0 ? "#10B981" : difference > 0 ? "#F59E0B" : "#EF4444",
                                    },
                                ]}
                            >
                                <Text style={[styles.differenceLabel, { color: "#1F2937" }]}>Selisih</Text>
                                <Text
                                    style={[
                                        styles.differenceValue,
                                        {
                                            color: difference === 0 ? "#064E3B" : difference > 0 ? "#92400E" : "#7F1D1D",
                                        },
                                    ]}
                                >
                                    {difference >= 0 ? "+" : ""}
                                    {formatCurrency(Math.abs(difference))}
                                </Text>
                                <Text
                                    style={[
                                        styles.differenceStatus,
                                        {
                                            color: difference === 0 ? "#064E3B" : difference > 0 ? "#92400E" : "#7F1D1D",
                                        },
                                    ]}
                                >
                                    {difference === 0 ? "✓ Sesuai" : difference > 0 ? "↑ Kelebihan" : "↓ Kekurangan"}
                                </Text>
                            </View>
                        )}

                        {/* Notes (Close Mode Only) */}
                        {mode === "close" && (
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>Catatan (Opsional)</Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                                    ]}
                                    placeholder="Tambahkan catatan jika ada..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </View>
                        )}

                        {/* Error Message */}
                        {error ? (
                            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
                        ) : null}
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { backgroundColor: colors.card }]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.submitButton,
                                { backgroundColor: colors.primary },
                                loading && styles.disabledButton,
                            ]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {mode === "open" ? "Buka Shift" : "Tutup Shift"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modal: {
        width: "90%",
        maxWidth: 500,
        maxHeight: "80%",
        borderRadius: 16,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    infoCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 12,
    },
    breakdown: {
        gap: 4,
    },
    breakdownText: {
        fontSize: 12,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    textArea: {
        padding: 16,
        borderRadius: 12,
        fontSize: 14,
        textAlignVertical: "top",
        borderWidth: 1,
    },
    differenceCard: {
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 2,
    },
    differenceLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    differenceValue: {
        fontSize: 28,
        fontWeight: "700",
        marginBottom: 4,
    },
    differenceStatus: {
        fontSize: 14,
        fontWeight: "600",
    },
    error: {
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    submitButton: {},
    disabledButton: {
        opacity: 0.6,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
});
