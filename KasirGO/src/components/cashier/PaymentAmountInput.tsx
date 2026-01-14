import React from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface PaymentAmountInputProps {
    amount: string;
    onAmountChange: (amount: string) => void;
    totalPrice: number;
    suggestions?: number[];
}

export default function PaymentAmountInput({
    amount,
    onAmountChange,
    totalPrice,
    suggestions = [],
}: PaymentAmountInputProps) {
    const { colors } = useTheme();

    const formatCurrency = (value: number) => {
        return `Rp ${value.toLocaleString("id-ID")}`;
    };

    const calculateChange = () => {
        const payment = parseFloat(amount) || 0;
        return Math.max(0, payment - totalPrice);
    };

    const defaultSuggestions = [
        Math.ceil(totalPrice / 1000) * 1000,
        totalPrice <= 50000 ? 50000 : totalPrice <= 100000 ? 100000 : totalPrice + 50000,
        totalPrice <= 100000 ? 100000 : totalPrice <= 200000 ? 200000 : totalPrice + 100000,
    ];

    const displaySuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Jumlah Pembayaran</Text>

            <View style={[
                styles.inputContainer,
                {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                }
            ]}>
                <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>Rp</Text>
                <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={amount}
                    onChangeText={onAmountChange}
                    placeholder="Masukkan jumlah pembayaran"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    selectTextOnFocus
                />
            </View>

            <View style={styles.quickAmountContainer}>
                {displaySuggestions.map((suggestedAmount) => (
                    <TouchableOpacity
                        key={suggestedAmount}
                        style={[styles.quickButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => onAmountChange(suggestedAmount.toString())}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.quickButtonText, { color: colors.text }]}>
                            {formatCurrency(suggestedAmount)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {amount && parseFloat(amount) >= totalPrice && (
                <View style={[styles.changeContainer, { borderColor: colors.primary, backgroundColor: colors.primary + "10" }]}>
                    <View style={styles.changeRow}>
                        <Text style={[styles.changeLabel, { color: colors.textSecondary }]}>Kembalian:</Text>
                        <Text style={[styles.changeAmount, { color: colors.primary }]}>
                            {formatCurrency(calculateChange())}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    currencyPrefix: {
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
    errorText: {
        fontSize: 13,
        color: "#ef4444",
        marginTop: -8,
    },
    quickAmountContainer: {
        flexDirection: "row",
        gap: 8,
    },
    quickButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
    },
    quickButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    changeContainer: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 16,
    },
    changeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    changeLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    changeAmount: {
        fontSize: 20,
        fontWeight: "700",
    },
});
