import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image } from "react-native";
import { X, Package, Tag, Banknote, Boxes, ShoppingBag } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { Product } from "../../api/product";

interface ProductDetailModalProps {
    visible: boolean;
    product: Product | null;
    onClose: () => void;
}

export default function ProductDetailModal({ visible, product, onClose }: ProductDetailModalProps) {
    const { colors } = useTheme();

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

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
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
                                <Package size={64} color={categoryColor} />
                            </View>
                        )}

                        <Text style={[styles.productName, { color: colors.text }]}>{product.product_name}</Text>

                        <View style={styles.detailsGrid}>
                            <View style={[styles.detailCard, { backgroundColor: colors.background }]}>
                                <View style={[styles.detailIconContainer, { backgroundColor: "#3b82f6" + "20" }]}>
                                    <Tag size={20} color="#3b82f6" />
                                </View>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Category</Text>
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

                            <View style={[styles.detailCard, { backgroundColor: colors.background }]}>
                                <View style={[styles.detailIconContainer, { backgroundColor: colors.primary + "20" }]}>
                                    <Banknote size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Selling Price</Text>
                                <Text style={[styles.detailValue, { color: colors.primary }]}>
                                    Rp {product.product_price.toLocaleString("id-ID")}
                                </Text>
                            </View>

                            <View style={[styles.detailCard, { backgroundColor: colors.background }]}>
                                <View style={[styles.detailIconContainer, { backgroundColor: (isLowStock ? "#f59e0b" : "#10b981") + "20" }]}>
                                    <Boxes size={20} color={isLowStock ? "#f59e0b" : "#10b981"} />
                                </View>
                                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Stock</Text>
                                <Text style={[styles.detailValue, { color: isLowStock ? "#f59e0b" : "#10b981" }]}>
                                    {product.product_qty !== undefined ? product.product_qty : "N/A"} units
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
                                <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>Purchase Price</Text>
                                <Text style={[styles.additionalValue, { color: colors.text }]}>
                                    Rp {product.product_cost.toLocaleString("id-ID")}
                                </Text>
                            </View>
                        )}

                        {product.product_min_stock !== null && product.product_min_stock !== undefined && (
                            <View style={[styles.additionalInfo, { backgroundColor: colors.background }]}>
                                <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>Minimum Stock</Text>
                                <Text style={[styles.additionalValue, { color: colors.text }]}>
                                    {product.product_min_stock} units
                                </Text>
                            </View>
                        )}

                        {product.product_description && (
                            <View style={[styles.descriptionSection, { backgroundColor: colors.background }]}>
                                <Text style={[styles.descriptionLabel, { color: colors.textSecondary }]}>Description</Text>
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

                        {isLowStock && (
                            <View style={[styles.warningBanner, { backgroundColor: "#f59e0b" + "20" }]}>
                                <Text style={[styles.warningText, { color: "#f59e0b" }]}>
                                    ⚠️ Low Stock Alert - Only {product.product_qty} units remaining
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 500,
        maxHeight: "80%",
        borderRadius: 16,
        padding: 24,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
    modalBody: {
        maxHeight: '100%',
    },
    productIcon: {
        width: 120,
        height: 120,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: 20,
    },
    productImageContainer: {
        width: 120,
        height: 120,
        alignSelf: "center",
        marginBottom: 20,
        borderRadius: 16,
        overflow: "hidden",
    },
    productImage: {
        width: "100%",
        height: "100%",
    },
    productName: {
        fontSize: 24,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 24,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 20,
    },
    detailCard: {
        flex: 1,
        minWidth: "45%",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    detailIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    additionalInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    additionalLabel: {
        fontSize: 14,
    },
    additionalValue: {
        fontSize: 16,
        fontWeight: "600",
    },
    warningBanner: {
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    warningText: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    descriptionSection: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    descriptionLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 20,
    },
    statusBadges: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
});
