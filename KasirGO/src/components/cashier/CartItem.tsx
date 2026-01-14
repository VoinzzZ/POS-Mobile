import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Plus, Minus, X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

export interface CartItemData {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartItemProps {
    item: CartItemData;
    onQuantityChange: (id: number, newQuantity: number) => void;
    onRemove: (id: number) => void;
}

export default function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
    const { colors } = useTheme();
    const subtotal = item.price * item.quantity;

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            <View style={styles.header}>
                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={[styles.price, { color: colors.textSecondary }]}>
                        Rp {item.price.toLocaleString("id-ID")} × {item.quantity}
                    </Text>
                </View>
                {item.quantity > 1 && (
                    <Text style={[styles.subtotal, { color: colors.primary }]}>
                        Rp {subtotal.toLocaleString("id-ID")}
                    </Text>
                )}
            </View>
            <View style={styles.actions}>
                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                        onPress={() => onQuantityChange(item.id, item.quantity - 1)}
                        activeOpacity={0.7}
                    >
                        <Minus size={20} color={colors.text} strokeWidth={2.5} />
                    </TouchableOpacity>
                    <View style={[styles.quantityDisplay, { backgroundColor: colors.card }]}>
                        <Text style={[styles.quantityText, { color: colors.text }]}>
                            {item.quantity}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                        onPress={() => onQuantityChange(item.id, item.quantity + 1)}
                        activeOpacity={0.7}
                    >
                        <Plus size={20} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: "#fee2e2" }]}
                    onPress={() => onRemove(item.id)}
                    activeOpacity={0.7}
                >
                    <X size={20} color="#ef4444" strokeWidth={2.5} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        gap: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    info: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 15,
        fontWeight: "600",
        lineHeight: 20,
    },
    price: {
        fontSize: 13,
    },
    subtotal: {
        fontSize: 15,
        fontWeight: "700",
        textAlign: "right",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    quantityButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    quantityDisplay: {
        minWidth: 50,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    quantityText: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    removeButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
});
