import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Platform } from "react-native";
import { X, Package, Tag, Banknote, Boxes, ShoppingBag } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { Product } from "../../api/product";

interface ProductDetailModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
}

export default function ProductDetailModal({ visible, product, onClose }: ProductDetailModalProps) {
    const { colors, theme } = useTheme();

    if (!product) return null;

    console.log('ProductDetailModal - product data:', JSON.stringify(product, null, 2));

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

    const isLowStock = product.product_qty !== undefined && product.product_qty < 10;
    const categoryColor = getCategoryColor(product.m_category?.category_name || "");

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Product Detail</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={true}
                        indicatorStyle={theme === "dark" ? "white" : "black"}
                        persistentScrollbar={Platform.OS === "android"}
                        style={styles.modalBody}
                        contentContainerStyle={styles.modalBodyContent}
                    >
                        <View style={styles.twoColumnLayout}>
                            <View style={styles.leftColumn}>
                                {product.product_image_url ? (
                                    <View style={styles.productImageContainer}>
                                        <Image
                                            source={{ uri: product.product_image_url }}
                                            style={styles.productImage}
                                            resizeMode="cover"
                                        />
                                    </View>
                                ) : (
                                    <View style={[styles.productIcon, { backgroundColor: categoryColor + "20" }]}>
                                        <Package size={80} color={categoryColor} />
                                    </View>
                                )}

                                <View style={[styles.leftColumnCard, { backgroundColor: colors.background }]}>
                                    <View style={styles.priceSection}>
                                        <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Harga Jual</Text>
                                        <Text style={[styles.priceValue, { color: colors.primary }]}>
                                            Rp {product.product_price.toLocaleString("id-ID")}
                                        </Text>
                                    </View>

                                    <View style={styles.stockSection}>
                                        <View style={[styles.stockIconContainer, { backgroundColor: (isLowStock ? "#f59e0b" : "#10b981") + "20" }]}>
                                            <Boxes size={24} color={isLowStock ? "#f59e0b" : "#10b981"} />
                                        </View>
                                        <View style={styles.stockInfo}>
                                            <Text style={[styles.stockLabel, { color: colors.textSecondary }]}>Stok Tersedia</Text>
                                            <Text style={[styles.stockValue, { color: isLowStock ? "#f59e0b" : "#10b981" }]}>
                                                {product.product_qty !== undefined ? product.product_qty : "N/A"} unit
                                            </Text>
                                        </View>
                                    </View>

                                    {isLowStock && (
                                        <View style={[styles.warningBanner, { backgroundColor: "#f59e0b" + "20" }]}>
                                            <Text style={[styles.warningText, { color: "#f59e0b" }]}>
                                                ⚠️ Stok Rendah
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View style={styles.rightColumn}>
                                <Text style={[styles.productName, { color: colors.text }]}>{product.product_name}</Text>

                                <View style={styles.detailsGrid}>
                                    <View style={[styles.detailCard, { backgroundColor: colors.background }]}>
                                        <View style={[styles.detailIconContainer, { backgroundColor: "#3b82f6" + "20" }]}>
                                            <Tag size={20} color="#3b82f6" />
                                        </View>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Kategori</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {product.m_category?.category_name || "N/A"}
                                        </Text>
                                    </View>

                                    <View style={[styles.detailCard, { backgroundColor: colors.background }]}>
                                        <View style={[styles.detailIconContainer, { backgroundColor: "#8b5cf6" + "20" }]}>
                                            <ShoppingBag size={20} color="#8b5cf6" />
                                        </View>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Brand</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {product.m_brand?.brand_name || "N/A"}
                                        </Text>
                                    </View>
                                </View>

                                {product.product_sku && (
                                    <View style={[styles.additionalInfo, { backgroundColor: colors.background }]}>
                                        <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>SKU</Text>
                                        <Text style={[styles.additionalValue, { color: colors.text }]}>
                                            {product.product_sku}
                                        </Text>
                                    </View>
                                )}

                                {product.product_cost && (
                                    <View style={[styles.additionalInfo, { backgroundColor: colors.background }]}>
                                        <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>Harga Beli</Text>
                                        <Text style={[styles.additionalValue, { color: colors.text }]}>
                                            Rp {product.product_cost.toLocaleString("id-ID")}
                                        </Text>
                                    </View>
                                )}

                                {product.product_min_stock !== null && product.product_min_stock !== undefined && (
                                    <View style={[styles.additionalInfo, { backgroundColor: colors.background }]}>
                                        <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>Stok Minimum</Text>
                                        <Text style={[styles.additionalValue, { color: colors.text }]}>
                                            {product.product_min_stock} unit
                                        </Text>
                                    </View>
                                )}

                                {product.product_description && (
                                    <View style={[styles.descriptionSection, { backgroundColor: colors.background }]}>
                                        <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>Deskripsi</Text>
                                        <Text style={[styles.descriptionText, { color: colors.text }]}>
                                            {product.product_description}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.statusBadges}>
                                    <View style={[styles.statusBadge, { backgroundColor: product.is_active ? "#10b981" + "20" : "#ef4444" + "20" }]}>
                                        <Text style={[styles.statusBadgeText, { color: product.is_active ? "#10b981" : "#ef4444" }]}>
                                            {product.is_active ? "✓ Active" : "✗ Inactive"}
                                        </Text>
                                    </View>
                                    {product.is_sellable && (
                                        <View style={[styles.statusBadge, { backgroundColor: "#3b82f6" + "20" }]}>
                                            <Text style={[styles.statusBadgeText, { color: "#3b82f6" }]}>
                                                ✓ Sellable
                                            </Text>
                                        </View>
                                    )}
                                    {product.is_track_stock && (
                                        <View style={[styles.statusBadge, { backgroundColor: "#8b5cf6" + "20" }]}>
                                            <Text style={[styles.statusBadgeText, { color: "#8b5cf6" }]}>
                                                ✓ Track Stock
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 900,
        maxHeight: "90%",
        borderRadius: 24,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.06)",
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: "rgba(0, 0, 0, 0.04)",
    },
    modalBody: {
        maxHeight: '100%',
    },
    modalBodyContent: {
        paddingBottom: 20,
    },
    twoColumnLayout: {
        flexDirection: "row",
        gap: 24,
    },
    leftColumn: {
        width: 280,
        flexShrink: 0,
    },
    rightColumn: {
        flex: 1,
    },
    productIcon: {
        width: 280,
        height: 280,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    productImageContainer: {
        width: 280,
        height: 280,
        marginBottom: 20,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.06)",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    leftColumnCard: {
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.04)",
    },
    priceSection: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.06)",
    },
    priceLabel: {
        fontSize: 13,
        fontWeight: "500",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    priceValue: {
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    stockSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    stockIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    stockInfo: {
        flex: 1,
    },
    stockLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginBottom: 4,
    },
    stockValue: {
        fontSize: 20,
        fontWeight: "700",
    },
    productName: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 24,
        lineHeight: 36,
        letterSpacing: 0.5,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 24,
    },
    detailCard: {
        flex: 1,
        minWidth: "45%",
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.04)",
    },
    detailIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 13,
        marginBottom: 6,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
    },
    additionalInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.04)",
    },
    additionalLabel: {
        fontSize: 15,
        fontWeight: "500",
    },
    additionalValue: {
        fontSize: 17,
        fontWeight: "700",
    },
    warningBanner: {
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#f59e0b",
    },
    warningText: {
        fontSize: 13,
        fontWeight: "700",
        textAlign: "center",
    },
    descriptionSection: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.04)",
    },
    descriptionLabel: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
    },
    statusBadges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 0,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(0, 0, 0, 0.08)",
    },
    statusBadgeText: {
        fontSize: 13,
        fontWeight: "700",
    },
});
