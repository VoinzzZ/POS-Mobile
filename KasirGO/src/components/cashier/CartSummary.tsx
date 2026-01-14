import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";

interface CartSummaryProps {
    totalItems: number;
    totalPrice: number;
    onClearCart: () => void;
}

export default function CartSummary({ totalItems, totalPrice, onClearCart }: CartSummaryProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.left}>
                <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
                    <ShoppingCart size={20} color="#fff" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{totalItems}</Text>
                    </View>
                </View>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {totalItems} Item{totalItems > 1 ? 's' : ''}
                    </Text>
                    <Text style={[styles.price, { color: colors.primary }]}>
                        Rp {totalPrice.toLocaleString("id-ID")}
                    </Text>
                </View>
            </View>
            <TouchableOpacity onPress={onClearCart}>
                <Text style={[styles.clearText, { color: "#ef4444" }]}>
                    Kosongkan
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingBottom: 12,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        backgroundColor: "#ef4444",
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },
    title: {
        fontSize: 14,
        fontWeight: "600",
    },
    price: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 2,
    },
    clearText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
