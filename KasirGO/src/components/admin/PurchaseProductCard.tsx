import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ShoppingCart, Package } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { Product } from "../../api/product";

interface PurchaseProductCardProps {
    product: Product;
    onPress: () => void;
}

export default function PurchaseProductCard({ product, onPress }: PurchaseProductCardProps) {
    const { colors } = useTheme();

    const isLowStock = product.product_qty < (product.product_min_stock || 10);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.card, { backgroundColor: colors.card }]}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
                <Package size={24} color={colors.primary} />
            </View>

            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {product.product_name}
                </Text>
                <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
                    {product.m_category?.category_name || "Uncategorized"} • {product.m_brand?.brand_name || "No Brand"}
                </Text>
                <View style={styles.bottomRow}>
                    <Text style={[styles.cost, { color: colors.textSecondary }]}>
                        Cost: Rp {(product.product_cost || 0).toLocaleString("id-ID")}
                    </Text>
                </View>
            </View>

            <View style={styles.rightSection}>
                <View style={[
                    styles.stockBadge,
                    { backgroundColor: isLowStock ? "#f59e0b15" : "#10b98115" }
                ]}>
                    <Text style={[styles.stockText, { color: isLowStock ? "#f59e0b" : "#10b981" }]}>
                        {product.product_qty} unit
                    </Text>
                </View>
                <View style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                    <ShoppingCart size={18} color="#fff" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        marginBottom: 6,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    cost: {
        fontSize: 13,
        fontWeight: "500",
    },
    rightSection: {
        alignItems: "flex-end",
        gap: 8,
    },
    stockBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    stockText: {
        fontSize: 12,
        fontWeight: "600",
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
});
