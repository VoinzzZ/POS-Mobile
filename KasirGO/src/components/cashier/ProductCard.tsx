import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Package } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { Product } from "../../api/product";

interface ProductCardProps {
    product: Product;
    onPress?: () => void;
    showStock?: boolean;
    gridView?: boolean;
}

export default function ProductCard({ product, onPress, showStock = true, gridView = false }: ProductCardProps) {
    const { colors } = useTheme();

    const getCategoryColor = (category: string) => {
        const colorMap: { [key: string]: string } = {
            Beverages: "#3b82f6",
            Food: "#f59e0b",
            Household: "#ec4899",
            Snacks: "#8b5cf6",
            Electronics: "#10b981",
        };
        return colorMap[category] || "#64748b";
    };

    const isLowStock = product.stock !== undefined && product.stock < 10;
    const categoryColor = getCategoryColor(product.m_category?.category_name || "");

    const GridCardContent = () => (
        <View style={[styles.gridCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.gridIconContainer, { backgroundColor: categoryColor + "20" }]}>
                <Package size={32} color={categoryColor} />
            </View>
            <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={2}>
                {product.name}
            </Text>
            <Text style={[styles.gridCategory, { color: colors.textSecondary }]} numberOfLines={1}>
                {product.m_category?.category_name || "Uncategorized"}
            </Text>
            <Text style={[styles.gridPrice, { color: colors.primary }]}>
                Rp {product.price.toLocaleString("id-ID")}
            </Text>
            {showStock && product.stock !== undefined && (
                <View style={[styles.gridStockBadge, { backgroundColor: isLowStock ? "#f59e0b" + "20" : "#10b981" + "20" }]}>
                    <Text style={[styles.gridStockText, { color: isLowStock ? "#f59e0b" : "#10b981" }]}>
                        {product.stock} units
                    </Text>
                </View>
            )}
        </View>
    );

    const ListCardContent = () => (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconContainer, { backgroundColor: categoryColor + "20" }]}>
                <Package size={24} color={categoryColor} />
            </View>
            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {product.name}
                </Text>
                <Text style={[styles.category, { color: colors.textSecondary }]}>
                    {product.m_category?.category_name || "Uncategorized"}
                </Text>
                <Text style={[styles.price, { color: colors.primary }]}>
                    Rp {product.price.toLocaleString("id-ID")}
                </Text>
            </View>
            {showStock && product.stock !== undefined && (
                <View style={styles.stockInfo}>
                    <Text style={[styles.stockValue, isLowStock && styles.stockLow, !isLowStock && { color: "#10b981" }]}>
                        {product.stock}
                    </Text>
                    <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>units</Text>
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={gridView ? styles.gridCardWrapper : undefined}>
                {gridView ? <GridCardContent /> : <ListCardContent />}
            </TouchableOpacity>
        );
    }

    return gridView ? <GridCardContent /> : <ListCardContent />;
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
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
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: "600",
    },
    stockInfo: {
        alignItems: "center",
    },
    stockValue: {
        fontSize: 24,
        fontWeight: "700",
    },
    stockLow: {
        color: "#f59e0b",
    },
    stockLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    gridCardWrapper: {
        width: "25%",
        paddingHorizontal: 6,
        marginBottom: 12,
    },
    gridCard: {
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
        minHeight: 200,
    },
    gridIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    gridName: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 4,
        minHeight: 36,
    },
    gridCategory: {
        fontSize: 11,
        textAlign: "center",
        marginBottom: 8,
    },
    gridPrice: {
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 8,
    },
    gridStockBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    gridStockText: {
        fontSize: 11,
        fontWeight: "600",
    },
});
