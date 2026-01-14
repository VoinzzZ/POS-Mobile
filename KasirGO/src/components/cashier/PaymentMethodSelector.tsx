import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";

type PaymentMethod = "CASH" | "QRIS" | "DEBIT";

interface PaymentMethodSelectorProps {
    selectedMethod: PaymentMethod;
    onMethodChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selectedMethod, onMethodChange }: PaymentMethodSelectorProps) {
    const { colors } = useTheme();

    const methods = [
        { value: "CASH" as PaymentMethod, label: "💵 Tunai", emoji: "💵" },
        { value: "QRIS" as PaymentMethod, label: "📱 QRIS", emoji: "📱" },
        { value: "DEBIT" as PaymentMethod, label: "💳 Debit", emoji: "💳" },
    ];

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>Metode Pembayaran</Text>
            <View style={styles.methodsContainer}>
                {methods.map((method) => {
                    const isSelected = selectedMethod === method.value;
                    return (
                        <TouchableOpacity
                            key={method.value}
                            style={[
                                styles.methodButton,
                                {
                                    backgroundColor: isSelected ? colors.primary : colors.card,
                                    borderColor: isSelected ? colors.primary : colors.border,
                                },
                            ]}
                            onPress={() => onMethodChange(method.value)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.emoji}>{method.emoji}</Text>
                            <Text
                                style={[
                                    styles.methodText,
                                    { color: isSelected ? "#fff" : colors.text }
                                ]}
                            >
                                {method.label.replace(method.emoji + " ", "")}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
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
    methodsContainer: {
        flexDirection: "row",
        gap: 8,
    },
    methodButton: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    emoji: {
        fontSize: 24,
    },
    methodText: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
});
