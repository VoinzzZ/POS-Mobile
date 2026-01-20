import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { TrendingUp, Package } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { transactionService } from "../../api/transaction";

interface TopProduct {
    product_id: number;
    product_name: string;
    product_image_url?: string;
    total_quantity: number;
    total_revenue: number;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
        .format(amount)
        .replace("IDR", "Rp");
};

export default function TopSellingProducts() {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(true);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

    useEffect(() => {
        fetchTopProducts();
    }, []);

    const fetchTopProducts = async () => {
        try {
            setLoading(true);
            const response = await transactionService.getTopProducts(3);
            if (response.success && response.data) {
                setTopProducts(response.data.topProducts);
            }
        } catch (error) {
            console.error("Failed to fetch top products:", error);
        } finally {
            setLoading(false);
        }
    };

    const getMaxQuantity = () => {
        if (topProducts.length === 0) return 1;
        return Math.max(...topProducts.map((p) => p.total_quantity));
    };

    const maxQuantity = getMaxQuantity();

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <View style={styles.header}>
                    <TrendingUp size={20} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>Top 3 Produk Terlaris</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                </View>
            </View>
        );
    }

    if (topProducts.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <View style={styles.header}>
                    <TrendingUp size={20} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>Top 3 Produk Terlaris</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
                        <Package size={32} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.emptyText, { color: colors.text }]}>Belum ada penjualan</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                        Produk terlaris akan muncul di sini
                    </Text>
                </View>
            </View>
        );
    }



    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.header}>
                <TrendingUp size={20} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>Top 3 Produk Terlaris</Text>
            </View>

            <View style={styles.productsContainer}>
                {topProducts.map((product, index) => {
                    const barWidth = maxQuantity > 0 ? (product.total_quantity / maxQuantity) * 100 : 0;
                    const rankColors = ['#f59e0b', '#9ca3af', '#cd7f32']; // Gold, Silver, Bronze

                    return (
                        <View key={product.product_id} style={styles.productRow}>
                            <View style={styles.productInfo}>
                                <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
                                    {product.product_image_url ? (
                                        <Image
                                            source={{ uri: product.product_image_url }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Package size={20} color={colors.textSecondary} />
                                    )}
                                </View>
                                <View style={styles.productDetails}>
                                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                                        {product.product_name}
                                    </Text>
                                    <Text style={[styles.productRevenue, { color: colors.textSecondary }]}>
                                        {formatCurrency(product.total_revenue)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.quantitySection}>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                backgroundColor: index < 3 ? rankColors[index] : colors.border,
                                                width: `${barWidth}%` as any,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.quantityText, { color: colors.text }]}>
                                    {product.total_quantity} <Text style={{ color: colors.textSecondary, fontWeight: "400" }}>terjual</Text>
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 20,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    emptyContainer: {
        padding: 32,
        alignItems: "center",
        gap: 8,
    },
    emptyIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 12,
        textAlign: "center",
    },
    productsContainer: {
        gap: 16,
        minHeight: 234,
    },
    productRow: {
        gap: 10,
    },
    productInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 6,
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    rankEmoji: {
        fontSize: 18,
    },
    rankText: {
        fontSize: 14,
        fontWeight: "700",
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 3,
        letterSpacing: -0.2,
    },
    productRevenue: {
        fontSize: 13,
        fontWeight: "500",
    },
    quantitySection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    barContainer: {
        flex: 1,
        height: 10,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: 5,
        overflow: "hidden",
    },
    bar: {
        height: "100%",
        borderRadius: 5,
        minWidth: 4,
    },
    quantityText: {
        fontSize: 13,
        fontWeight: "700",
        width: 90,
        textAlign: "right",
        letterSpacing: -0.2,
    },
});
